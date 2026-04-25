import { z } from "zod";

export const userSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  level: z.string().optional()
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  level: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
