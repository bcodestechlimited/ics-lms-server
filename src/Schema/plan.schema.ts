import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, { message: "Plan name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  planType: z.enum(["BASIC", "PREMIUM", "ENTERPRISE"], {
    required_error: "Plan type is required",
  }),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive({ message: "Price must be greater than 0" }),
  duration: z.enum(["monthly", "yearly"], {
    required_error: "Duration is required",
  }),
  features: z.array(z.string()).optional().default([]),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInterface = z.infer<typeof createPlanSchema>;
