import mongoose, {Document, Schema, Types} from "mongoose";

interface IOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface IQuestion extends Document {
  _id: string;
  question: string;
  type: "single" | "multiple";
  options: IOption[];
  courseId: Types.ObjectId;
}

export type AssessmentDocument = Document<any, any, IQuestion> &
  IQuestion & {_id: Types.ObjectId};

// const updatedQuestions: AssessmentDocument[] = [];

const OptionSchema = new Schema<IOption>(
  {
    id: {type: Number, required: true},
    text: {type: String, required: true},
    isCorrect: {type: Boolean, required: true, select: false},
  },
  {_id: false}
);

const QuestionSchema = new Schema<IQuestion>(
  {
    question: {type: String, required: true},
    type: {type: String, enum: ["single", "multiple"], required: true},
    options: {type: [OptionSchema], required: true},
    courseId: {type: Schema.Types.ObjectId, ref: "Course", required: true},
  },
  {timestamps: true}
);

const CourseAssessment = mongoose.model<IQuestion>(
  "CourseAssessment",
  QuestionSchema
);

QuestionSchema.statics.findWithCorrectAnswers = function () {
  return this.find().select("+options.isCorrect");
};

export default CourseAssessment;
