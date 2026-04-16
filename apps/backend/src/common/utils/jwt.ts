import type { UserRole } from "@recipes/shared";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "@/config/env.js";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
