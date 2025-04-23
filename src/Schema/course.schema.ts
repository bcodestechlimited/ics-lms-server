import { z } from "zod";

const CreateCourseSchema = z.object({
  title: z.string({ message: "Course title is required" }),
  description: z.string({ message: "Course description is required" }),
  courseImage: z.string({}),
});

const CreateCourseBenchmarkSchema = z.object({
  courseId: z.string({ message: "Course ID is required" }),
  retakes: z
    .number()
    .min(0)
    .max(10, "Course retakes cannot be greater than 10"),
  benchmark: z
    .number()
    .min(50, "Course Benchmark must be at least 50%")
    .max(100, "Course Benchmark cannot be greater than 100%"),
});

const CreateCourseAssessmentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  questions: z
    .array(
      z.object({
        question: z.string().min(1, "Question text is required"),
        type: z.enum(["single", "multiple"], {
          invalid_type_error: "Question type must be 'single' or 'multiple'",
        }),
        options: z
          .array(
            z.object({
              id: z.number().int("Option ID must be an integer").optional(),
              text: z.string().min(1, "Option text is required"),
              isCorrect: z.boolean(),
            })
          )
          .min(1, "At least one option is required per question"),
      })
    )
    .min(1, "At least one question is required"),
});

const CreateCoursePricingSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  coursePrice: z.number().min(1, "Course price must be at least 1"),
  courseCoupon: z.string().optional(),
});

const bulkAssignCourseSchema = z.object({
  courseIds: z.array(z.string()).min(1, "At least one course ID is required"),
  durationDays: z.number().min(1, "Duration days must be at least 1"),
  isIcsStaff: z.boolean(),
});

export {
  CreateCourseSchema,
  CreateCourseBenchmarkSchema,
  CreateCourseAssessmentSchema,
  CreateCoursePricingSchema,
  bulkAssignCourseSchema,
};
