import { z } from "zod";
import { userSchema } from "../users/user.schema.js";

export const registerSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim().min(6),
  name: z.string().trim().min(2).max(100),
  level: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});
