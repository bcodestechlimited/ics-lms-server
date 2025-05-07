import mongoose, { Document, Schema, Types } from "mongoose";
import autopopulate from "mongoose-autopopulate";

mongoose.plugin(autopopulate);
export interface CourseProgressInterface extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  completed: boolean;
  completedAt: Date | undefined;
  progressPercentage: number;
  modules: {
    module: Types.ObjectId;
    completed: boolean;
    completedAt: Date | undefined;
  }[];
  score: number;
  certificateIssued: boolean;
  status: string;
  assessmentAttempts: number;
  assessmentHistory: {
    attempt: number;
    timestamp: Date;
    score: number;
    passed: boolean;
    isFinalAttempt: boolean;
    answers: {
      questionId: Types.ObjectId;
      selectedOptionId: number;
      isCorrect: boolean;
    }[];
  }[];
  currentAttempt: number;
}

export enum CourseStatusEnum {
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  LOCKED_OUT = "lock-out",
  NOT_STARTED = "not-started",
  FAILED = "failed",
}

const ProgressSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      autopopulate: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    modules: [
      {
        module: {
          type: Schema.Types.ObjectId,
          ref: "CourseModule",
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(CourseStatusEnum),
      default: CourseStatusEnum.NOT_STARTED,
    },
    assessmentAttempts: {
      type: Number,
      default: 0,
    },
    assessmentHistory: [
      {
        attempt: Number,
        timestamp: Date,
        score: Number,
        passed: Boolean,
        isFinalAttempt: Boolean,
        answers: [
          {
            questionId: {type: Schema.Types.ObjectId, ref: "CourseAssessment"},
            selectedOptionId: Number,
            isCorrect: Boolean,
          },
        ],
      },
    ],
    currentAttempt: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model<CourseProgressInterface>(
  "Progress",
  ProgressSchema
);
export default Progress;
