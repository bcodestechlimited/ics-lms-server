import { Document, Schema, model } from "mongoose";

export interface IPlan extends Document {
  name: string;
  description: string;
  planType: "BASIC" | "PREMIUM" | "ENTERPRISE";
  price: number;
  duration: "monthly" | "yearly";
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    planType: {
      type: String,
      enum: ["BASIC", "PREMIUM", "ENTERPRISE"],
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: String, enum: ["monthly", "yearly"], required: true },
    features: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Plan = model<IPlan>("Plan", PlanSchema);
export default Plan;
