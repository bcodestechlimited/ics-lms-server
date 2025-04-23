import {Document, model, Schema, Types} from "mongoose";

interface IModule {
  title: string;
  resources: {name: string; content: string; duration: string}[];
}

interface ICourseModule {
  title: string;
  duration: string;
  modules: IModule[];
}

interface ICourse extends Document {
  course_title: string;
  course_description: string;
  course_modules: ICourseModule[];
  isCompleted: boolean;
  progress: number;
  user: [Types.ObjectId];
}

const resourceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: false,
  },
});

const moduleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  resources: {
    type: [resourceSchema],
    required: true,
  },
});

const courseModuleSchema = new Schema<ICourseModule>({
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: false,
  },
  modules: [
    {
      type: moduleSchema,
      required: true,
    },
  ],
});

const courseSchema = new Schema<ICourse>(
  {
    course_title: {
      type: String,
      required: true,
    },
    course_description: {
      type: String,
      required: true,
    },
    course_modules: [courseModuleSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const BCTCourse = model<ICourse>("BCTCourse", courseSchema);

export default BCTCourse;
