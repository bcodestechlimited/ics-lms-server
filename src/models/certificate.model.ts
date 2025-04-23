import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

interface ICertificate extends Document {
  userName: string;
  courseTitle: string;
  // cloudinaryId: string;
  cloudinaryUrl: string;
  createdAt: Date;
}

const certificateSchema = new Schema<ICertificate>(
  {
    userName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    // cloudinaryId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const CourseCertificateModel = mongoose.model<ICertificate>(
  "CourseCertificate",
  certificateSchema
);

export default CourseCertificateModel;
