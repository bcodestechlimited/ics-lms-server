import {z} from "zod";

export const AdminAcceptUserRequestForCourseExtensionSchema = z.object({
  extensionId: z.string({message: "User id is required"}),
  extensionDays: z.number({message: "Extension days is required"}),
});

export const AdminRejectUserRequestForCourseExtensionSchema = z.object({
  extensionId: z.string({message: "User id is required"}),
  courseTitle: z.string({message: "Course title is required"}),
});