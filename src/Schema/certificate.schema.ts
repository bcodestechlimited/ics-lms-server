import { z } from "zod";

export const CreateCertificateSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  courseTitle: z.string(),
});
