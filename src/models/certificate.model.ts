import {Document, Schema, model, Types} from "mongoose";

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  path: string;
  fileName: string;
  issuedAt: Date;
  createdAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    courseId: {type: Schema.Types.ObjectId, ref: "Course", required: true},
    path: {type: String, required: true},
    fileName: {type: String, required: true},
    issuedAt: {type: Date, default: Date.now},
  },
  {timestamps: true}
);

// Create a compound index to ensure uniqueness per user and course
CertificateSchema.index({userId: 1, courseId: 1}, {unique: true});

export default model<ICertificate>("Certificate", CertificateSchema);
