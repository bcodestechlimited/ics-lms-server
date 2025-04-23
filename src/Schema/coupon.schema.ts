import { z } from "zod";
import { mongooseIDSchema } from "../utils";

export const CreateCouponSchema = z.object({
  discountType: z.enum(["FLASH_SALE", "FIRST_TIME_USER", "LIMITED_TIME"]),
  percentage: z.number().min(1).max(100),
  expirationDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date()),
  maximumUsage: z.number().min(1),
  courseId: z.string(),
});

export const UpdateCouponSchema = z.object({
  expirationDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      return new Date(arg);
    }
  }, z.date()),
  maximumUsage: z.number().min(1),
  courseId: z.string(),
});

export const ApplyCouponSchema = z.object({
  couponCode: z.string({message: "A coupon code is required"}),
  courseId: mongooseIDSchema,
  coursePrice: z.number().min(1),
});

export const CouponCheckoutSchema = z.object({
  couponCode: z.string({message: "A coupon code is required"}),
  courseId: mongooseIDSchema,
});

export type CreateCouponInterface = z.infer<typeof CreateCouponSchema>;
export type ApplyCouponInterface = z.infer<typeof ApplyCouponSchema>;

export const EditCouponSchema = z.object({});
