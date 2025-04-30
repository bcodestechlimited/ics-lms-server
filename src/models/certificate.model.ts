import mongoose, {Document, Schema, model, Types} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  courseId: any;
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

CertificateSchema.plugin(mongoosePaginate);

// Create a compound index to ensure uniqueness per user and course
CertificateSchema.index({userId: 1, courseId: 1}, {unique: true});

export interface ICertificateModel<T extends Document>
  extends mongoose.PaginateModel<T> {}

const Certificate = model<ICertificate>(
  "Certificate",
  CertificateSchema
) as ICertificateModel<ICertificate>;

export default Certificate;
