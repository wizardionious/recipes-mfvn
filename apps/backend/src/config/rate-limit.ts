import type { RateLimitPluginOptions } from "@fastify/rate-limit";
import { env } from "@/config/env.js";

export function createRateLimitOptions(): RateLimitPluginOptions {
  return {
    global: false,
    max: env.RATE_LIMIT_GLOBAL_MAX,
    timeWindow: env.RATE_LIMIT_GLOBAL_WINDOW,
    keyGenerator: (request) => request.ip,
    // errorResponseBuilder: (_request, context) => ({
    //   error: "Too many requests",
    //   statusCode: 429,
    //   retryAfter: context.after,
    // }),
  };
}
