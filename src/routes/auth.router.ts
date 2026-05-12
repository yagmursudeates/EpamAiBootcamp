import { Router, Request, Response } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";
import { ipRateLimiter, accountRateLimiter } from "../middleware/rate-limit";
import { register, login, logout, logoutAll, DuplicateEmailError, InvalidCredentialsError } from "../services/auth.service";
import { issueAccessToken, issueRefreshToken, rotateRefreshToken, InvalidRefreshTokenError, TokenReuseDetectedError } from "../services/token.service";
import { requestReset, completeReset, InvalidResetTokenError } from "../services/password.service";
import { NodemailerEmailService } from "../services/email.service";
import { env } from "../config/env";

export const authRouter = Router();

const emailService = new NodemailerEmailService();

// --- Schemas ---

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
});

// --- Routes ---

/** POST /auth/register — FR-001, FR-002 */
authRouter.post("/register", validate(registerSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as z.infer<typeof registerSchema>;
  try {
    await register(email, password, req.ip ?? "");
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      res.status(409).json({ error: "Email already registered" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/** POST /auth/login — FR-003, FR-004, FR-008, FR-010 */
authRouter.post("/login", ipRateLimiter, accountRateLimiter, validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  try {
    const userId = await login(email, password, req.ip ?? "");
    const accessToken = issueAccessToken(userId);
    const refreshToken = await issueRefreshToken(userId);
    res.status(200).json({ accessToken, refreshToken, expiresIn: 86400 });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/** POST /auth/refresh — FR-004, FR-005 */
authRouter.post("/refresh", validate(refreshSchema), async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
  try {
    const tokens = await rotateRefreshToken(refreshToken, req.ip ?? "");
    res.status(200).json({ ...tokens, expiresIn: 86400 });
  } catch (err) {
    if (err instanceof InvalidRefreshTokenError || err instanceof TokenReuseDetectedError) {
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/** POST /auth/logout — FR-009, FR-013 */
authRouter.post("/logout", authenticate, validate(refreshSchema), async (req: Request, res: Response): Promise<void> => {
  const { sub } = (req as AuthenticatedRequest).auth;
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
  const { createHash } = await import("crypto");
  const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
  await logout(sub, tokenHash, req.ip ?? "");
  res.status(204).send();
});

/** POST /auth/logout-all — FR-013 */
authRouter.post("/logout-all", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { sub } = (req as AuthenticatedRequest).auth;
  await logoutAll(sub, req.ip ?? "");
  res.status(204).send();
});

/** POST /auth/forgot-password — FR-006, FR-010, FR-012 */
authRouter.post("/forgot-password", ipRateLimiter, validate(forgotPasswordSchema), async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as z.infer<typeof forgotPasswordSchema>;
  try {
    await requestReset(email, emailService, req.ip ?? "", env.APP_BASE_URL);
  } catch {
    // Swallow errors — always return 200 (FR-006, FR-012)
  }
  res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
});

/** POST /auth/reset-password — FR-006, FR-007 */
authRouter.post("/reset-password", validate(resetPasswordSchema), async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body as z.infer<typeof resetPasswordSchema>;
  try {
    await completeReset(token, password, req.ip ?? "");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    if (err instanceof InvalidResetTokenError) {
      res.status(400).json({ error: "Invalid or expired reset token" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
