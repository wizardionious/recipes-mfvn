import type { z } from "zod";
import type { userSchema, userSummarySchema } from "./user.schema.js";

export type UserRole = "user" | "admin";

export type UserSummary = z.infer<typeof userSummarySchema>;
export type User = z.infer<typeof userSchema>;
