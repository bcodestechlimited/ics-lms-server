import mongoose, { Schema } from "mongoose";

interface ICourseBenchmark extends Document {
  retakes: number;
  benchmark: number;
  course: mongoose.Types.ObjectId;
}

const BenchmarkSchema = new Schema<ICourseBenchmark>(
  {
    retakes: {
      type: Number,
      required: true,
      min: [0, "Retakes must be at least 0"],
      max: [10, "Retakes cannot exceed 10"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value for retakes",
      },
    },
    benchmark: {type: Number, required: true},
    course: {type: Schema.Types.ObjectId, ref: "Course"},
  },
  {timestamps: true}
);

const CourseBenchmark = mongoose.model<ICourseBenchmark>(
  "CourseBenchmark",
  BenchmarkSchema
);

export default CourseBenchmark;
