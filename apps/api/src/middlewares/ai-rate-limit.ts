import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const DEFAULT_AI_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const DEFAULT_AI_RATE_LIMIT_MAX = 30;

export interface AiRateLimitOptions {
  windowMs?: number;
  limit?: number;
}

/**
 * Builds a per-authenticated-user rate limiter for AI endpoints.
 */
export function createAiRateLimit(options: AiRateLimitOptions = {}) {
  return rateLimit({
    windowMs: options.windowMs ?? DEFAULT_AI_RATE_LIMIT_WINDOW_MS,
    limit: options.limit ?? DEFAULT_AI_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    statusCode: 429,
    keyGenerator: (req) => {
      if (req.user?.id !== undefined) {
        return `user:${req.user.id}`;
      }
      return ipKeyGenerator(req.ip ?? "127.0.0.1");
    },
    message: {
      data: null,
      error: {
        message: "Too many AI requests. Please try again later.",
      },
      meta: {},
    },
  });
}

export const aiRateLimit = createAiRateLimit();
