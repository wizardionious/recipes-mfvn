import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default("0.0.0.0"),
    MONGO_URI: z.string(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.string().default("7d"),
    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
    RATE_LIMIT_AUTH_MAX: z.coerce.number().default(5),
    RATE_LIMIT_AUTH_WINDOW: z.string().default("3 minutes"),
    RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(100),
    RATE_LIMIT_GLOBAL_WINDOW: z.string().default("1 minute"),
    ROOT_ADMIN_EMAIL: z.string().min(6),
    ROOT_ADMIN_PASSWORD: z
      .string()
      .min(10)
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    CACHE_BACKEND: z.enum(["memory", "redis"]).default("memory"),
    REDIS_URL: z.string().optional(),
  })
  .refine(
    (values) => {
      if (values.CACHE_BACKEND === "redis" && !values.REDIS_URL) {
        return false;
      }
      return true;
    },
    {
      error: "Redis URL is required when using Redis cache",
      path: ["REDIS_URL"],
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    z.treeifyError(parsed.error),
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
