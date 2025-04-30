import {Document, Schema, model, Types} from "mongoose";

export interface ICourseCompletion extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  completedAt: Date;
  createdAt: Date;
}

const CourseCompletionSchema = new Schema<ICourseCompletion>(
  {
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
    courseId: {type: Schema.Types.ObjectId, ref: "Course", required: true},
    completedAt: {type: Date, required: true},
  },
  {timestamps: true}
);

// Create a compound index to ensure uniqueness per user and course
CourseCompletionSchema.index({userId: 1, courseId: 1}, {unique: true});

export default model<ICourseCompletion>(
  "CourseCompletion",
  CourseCompletionSchema
);
