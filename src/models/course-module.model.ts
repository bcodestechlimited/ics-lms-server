import mongoose, { InferSchemaType, Schema, Document } from "mongoose";
import autopopulate from "mongoose-autopopulate";
import { ICourseModule } from "../interfaces/course-module.interface";

mongoose.plugin(autopopulate);
const { ObjectId } = mongoose.Schema;

const OptionSchema = new Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const CourseSectionSchema = new Schema({
  sectionId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["list", "image", "video", "quote", "knowledge-check"],
  },
  content: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function (value: any) {
        // @ts-ignore
        const type = this.type;
        switch (type) {
          case "list":
          case "image":
          case "video":
            return typeof value === "string";
          case "quote":
            return (
              value.quoteText !== undefined && value.authorName !== undefined
            );
          case "knowledge-check":
            return (
              value.question !== undefined &&
              value.type !== undefined &&
              Array.isArray(value.options)
            );
          default:
            return false;
        }
      },
      message: "Invalid content format for the specified section type",
    },
  },
});

const CourseModuleSchema = new Schema(
  {
    courseId: {
      type: ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
    },
    contentSections: [CourseSectionSchema],
  },
  {
    timestamps: true,
  }
);

CourseModuleSchema.index({ courseId: 1, order: 1 });
export const CourseModule = mongoose.model<ICourseModule & Document>(
  "CourseModule",
  CourseModuleSchema
);
