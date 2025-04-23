import mongoose, {Document, Schema, model, PaginateModel} from "mongoose";
import paginator from "mongoose-paginate-v2";

export interface IUserCourseRequest extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  status: string;
  extensionDays: number;
  reason: string;
  createdAt: Date;
  expiredAt: Date;
  updatedAt: Date;
}

export enum CourseRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

mongoose.plugin(paginator);
const UserExtensionCourseRequestSchema = new Schema<IUserCourseRequest>(
  {
    user: {type: Schema.Types.ObjectId, required: true, ref: "User"},
    course: {type: Schema.Types.ObjectId, required: true, ref: "Course"},
    status: {
      type: String,
      default: CourseRequestStatus.PENDING,
      enum: Object.values(CourseRequestStatus),
    },
    expiredAt: {type: Date, required: true},
    reason: {type: String, required: true},
    extensionDays: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const UserCourseExtensionRequest = model<
  IUserCourseRequest,
  PaginateModel<IUserCourseRequest>
>("UserCourseRequestSchema", UserExtensionCourseRequestSchema);

export default UserCourseExtensionRequest;
