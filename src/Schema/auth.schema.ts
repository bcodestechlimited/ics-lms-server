import {z} from "zod";

export const RegisterSchema = z.object({
  email: z.string({message: "Email is required"}).email("Invalid email format"),
  telephone: z
    .string({message: "Telephone is required"})
    .min(10, "Telephone number must be 11 digits"),
  firstName: z.string({message: "Firstname is required"}),
  lastName: z.string({message: "Lastname is required"}),
  password: z
    .string()
    .min(6, {message: "Password must be atleast 6 characters long"})
    .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
      message: "Password must contain at least one special character",
    })
    .refine((value) => /\d/.test(value), {
      message: "Password must contain at least one number",
    }),
});

export const LoginSchema = z.object({
  email: z.string({message: "Email is required"}).email("Invalid email format"),
  password: z.string({message: "Password is required"}),
});

export const OnboardStaffSchema = z.object({
  email: z.string({message: "Email is required"}).email("Invalid email format"),
  token: z.string({message: "Token is required"}),
  password: z.string({message: "Password is required"}),
  newPassword: z.string({message: "New Password is required"}),
});

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string({message: "Password is required"}),
  newPassword: z.string({message: "New Password is required"}),
});

export const UserRequestForCourseExtensionSchema = z.object({
  courseId: z.string({message: "Course ID is required"}),
  userId: z.string({message: "User ID is required"}),
  reason: z.string({message: "Reason is required"}),
  extensionDays: z
    .number({message: "Days is required"})
    .min(1, "Must request at least 1 day"),
  expiryDate: z.string(),
});
