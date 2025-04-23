import {Document, Schema, model} from "mongoose";

export interface ICertificateTemplate extends Document {
  path: string;
  originalName: string;
  updatedAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>({
  path: {type: String, required: true},
  originalName: String,
  updatedAt: {type: Date, default: Date.now},
});

export default model<ICertificateTemplate>(
  "CertificateTemplate",
  CertificateTemplateSchema
);
