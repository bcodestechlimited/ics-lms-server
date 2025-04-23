// models/template.model.ts
import mongoose, { Schema, Document } from "mongoose";

interface ITemplateModule {
  title: string;
  description?: string;
  order: number;
  contentSections: any[];
}

interface ITemplateAssessment {
  question: string;
  type: "single" | "multiple";
  options: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
}

interface ITemplatePricing {
  coursePricing: number;
  courseCoupon: mongoose.Types.ObjectId[];
}

interface ITemplateBenchmark {
  retakes: number;
  benchmark: number;
}

interface ITemplate extends Document {
  name: string;
  description?: string;
  courseData: {
    title: string;
    description?: string;
    caption?: string;
    skillLevel?: string;
    duration?: string;
    courseDuration?: string;
    amount?: number;
    image?: string;
    certificate?: string;
    benefits?: string[];
    language?: string;
    softwares?: string[];
    status?: string;
    isApproved?: boolean;
    isPublished?: boolean;
  };
  modules: ITemplateModule[];
  assessments: ITemplateAssessment[];
  pricing?: ITemplatePricing;
  benchmark?: ITemplateBenchmark;
}

const TemplateModuleSchema = new Schema<ITemplateModule>({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  contentSections: [Schema.Types.Mixed],
});

const TemplateAssessmentSchema = new Schema<ITemplateAssessment>({
  question: { type: String, required: true },
  type: { type: String, enum: ["single", "multiple"], required: true },
  options: [
    {
      id: Number,
      text: String,
      isCorrect: Boolean,
    },
  ],
});

const TemplatePricingSchema = new Schema<ITemplatePricing>({
  coursePricing: { type: Number, default: 1 },
  courseCoupon: [{ type: Schema.Types.ObjectId, ref: "CourseCoupon" }],
});

const TemplateBenchmarkSchema = new Schema<ITemplateBenchmark>({
  retakes: { type: Number, required: true },
  benchmark: { type: Number, required: true },
});

const TemplateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    description: String,
    courseData: {
      title: { type: String, required: true },
      description: String,
      caption: String,
      skillLevel: String,
      duration: String,
      courseDuration: String,
      amount: Number,
      image: { type: String, default: "https://placehold.co/600x400" },
      certificate: String,
      benefits: [String],
      language: { type: String, default: "english" },
      softwares: [String],
      status: { type: String, default: "active" },
      isApproved: Boolean,
      isPublished: { type: Boolean, default: false },
    },
    modules: [TemplateModuleSchema],
    assessments: [TemplateAssessmentSchema],
    pricing: TemplatePricingSchema,
    benchmark: TemplateBenchmarkSchema,
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>("Template", TemplateSchema);
