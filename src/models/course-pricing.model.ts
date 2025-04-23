import mongoose, { Document, Schema } from "mongoose";

export interface ICoursePricing extends Document {
  courseId: mongoose.Types.ObjectId;
  coursePricing: number;
  courseCoupon: mongoose.Types.ObjectId[];
}

const CoursePricingSchema = new Schema<ICoursePricing>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    coursePricing: {
      type: Number,
      default: 1,
    },
    courseCoupon: [
      {
        type: Schema.Types.ObjectId,
        ref: "CourseCoupon", // yet to be created
      },
    ],
  },
  { timestamps: true }
);

const CoursePricing = mongoose.model<ICoursePricing>(
  "CoursePricing",
  CoursePricingSchema
);

export default CoursePricing;
