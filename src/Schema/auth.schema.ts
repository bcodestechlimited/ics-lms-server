import { z } from "zod";

const PasswordSchema = z.string().max(100);

export const RegisterSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
  telephone: z
    .string({ message: "Telephone is required" })
    .min(10, "Telephone number must be 11 digits"),
  firstName: z.string({ message: "Firstname is required" }),
  lastName: z.string({ message: "Lastname is required" }),
  password: z.string().max(100),
});

export const LoginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
  password: z.string({ message: "Password is required" }).max(100),
});

export const OnboardStaffSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),
  token: z.string({ message: "Token is required" }),
  password: z.string({ message: "Password is required" }).max(100),
  newPassword: z.string({ message: "New Password is required" }).max(100),
});

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string({ message: "Password is required" }).max(100),
  newPassword: z.string({ message: "New Password is required" }).max(100),
});

export const UserRequestForCourseExtensionSchema = z.object({
  courseId: z.string({ message: "Course ID is required" }),
  userId: z.string({ message: "User ID is required" }),
  reason: z.string({ message: "Reason is required" }),
  extensionDays: z
    .number({ message: "Days is required" })
    .min(1, "Must request at least 1 day"),
  expiryDate: z.string(),
});

export const ResetPasswordSchema = z.object({
  newPassword: PasswordSchema,
  token: z.string(),
});
