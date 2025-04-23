import { z } from "zod";

export const mongooseIDSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);
