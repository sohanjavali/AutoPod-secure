import type { Request, Response } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

function numFromEnv(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const WINDOW_MS = 15 * 60 * 1000;

function build(limit: number, keyed: boolean) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    ...(keyed
      ? {
          keyGenerator: (req: Request, res: Response) =>
            (res.locals.user?.id as string | undefined) ?? ipKeyGenerator(req.ip ?? ""),
        }
      : {}),
    handler: (_req, res) => {
      res.status(429).json({ error: "Too many requests. Please try again later." });
    },
  });
}

// Light global limiter keyed by IP
export const globalLimiter = build(numFromEnv("RATE_LIMIT_GLOBAL", 300), false);

// Per-user limiters, apply AFTER authMiddleware
export const generateLimiter = build(numFromEnv("RATE_LIMIT_GENERATE", 5), true);
export const validateLimiter = build(numFromEnv("RATE_LIMIT_VALIDATE", 30), true);
