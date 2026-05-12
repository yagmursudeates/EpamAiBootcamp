import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Per-IP rate limiter: max 5 requests per 15-minute window (FR-010).
 * Applied to login and password-reset endpoints.
 */
export const ipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({ error: "Too many requests. Please try again later." });
  },
});

/**
 * Per-account rate limiter: max 10 failed attempts per 30-minute window (FR-010).
 * Keyed on the normalised email from request body.
 * Counts only on failure — use `skipSuccessfulRequests: true`.
 */
export const accountRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    const email = (req.body as Record<string, unknown>)?.["email"];
    return typeof email === "string" ? email.toLowerCase().trim() : req.ip ?? "unknown";
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({ error: "Too many requests. Please try again later." });
  },
});
