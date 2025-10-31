import {NodeSDK} from "@opentelemetry/sdk-node";
import {resourceFromAttributes} from "@opentelemetry/resources";
import {getNodeAutoInstrumentations} from "@opentelemetry/auto-instrumentations-node";
import {OTLPTraceExporter} from "@opentelemetry/exporter-trace-otlp-http";
import {PeriodicExportingMetricReader} from "@opentelemetry/sdk-metrics";
import {OTLPMetricExporter} from "@opentelemetry/exporter-metrics-otlp-http";

const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const traceExporter = new OTLPTraceExporter({
  url: `${base}/v1/traces`,
  // headers: { Authorization: `Bearer ${process.env.GRAFANA_API_KEY}` },
});

const metricExporter = new OTLPMetricExporter({
  url: `${base}/v1/metrics`,
  // headers: { Authorization: `Bearer ${process.env.GRAFANA_API_KEY}` },
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  // optional: export interval in ms (default ~60000)
  // exportIntervalMillis: 15000,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    // Use the literal key; the enum is deprecated
    "service.name": process.env.OTEL_SERVICE_NAME ?? "ics lms",
  }),
  traceExporter,
  metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": {enabled: true},
      "@opentelemetry/instrumentation-express": {enabled: true},
    } as any),
  ],
});

sdk.start();

// Graceful shutdown
const shutdown = () => {
  sdk.shutdown().finally(() => process.exit(0));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
