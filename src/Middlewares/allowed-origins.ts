import {APP_CONFIG} from "../config/app.config";

const allowedOrigins = APP_CONFIG.CORS_ORIGIN.split(",");

export const handleAllowedOrigins = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (!origin) return callback(null, true);

  try {
    const url = new URL(origin);

    if (url.hostname.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some((allowed) => {
      try {
        const allowedUrl = new URL(allowed);
        return url.hostname === allowedUrl.hostname;
      } catch {
        return origin === allowed;
      }
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  } catch {
    return callback(new Error("Invalid origin"));
  }
};
