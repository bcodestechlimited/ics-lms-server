import {Document, Schema, model} from "mongoose";

export interface ICertificateTemplate extends Document {
  path: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  updatedAt: Date;
  createdAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    path: {type: String, required: true},
    originalName: {type: String, required: true},
    fileType: {type: String, required: true},
    fileSize: {type: Number, required: true},
  },
  {
    timestamps: true,
  }
);

export default model<ICertificateTemplate>(
  "CertificateTemplate",
  CertificateTemplateSchema
);
