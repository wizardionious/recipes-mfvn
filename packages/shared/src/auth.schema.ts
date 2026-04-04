import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim().min(6),
  name: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().trim(),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
