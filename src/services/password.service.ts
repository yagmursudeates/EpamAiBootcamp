import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../db/client";
import { auditLog } from "../audit/logger";
import type { IEmailService } from "./email.interface";

const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MINUTES = 15;

/** Error thrown when the reset token is invalid, expired, or already used. */
export class InvalidResetTokenError extends Error {
  constructor() {
    super("Invalid or expired reset token");
    this.name = "InvalidResetTokenError";
  }
}

/**
 * Initiates a password reset for the given email address.
 * Always resolves successfully regardless of whether the email is registered,
 * to prevent user enumeration (FR-006, FR-008).
 * Emits PASSWORD_RESET_REQUESTED audit log on success (FR-011).
 *
 * @param email - Email address from request
 * @param emailService - Injected email service (mockable in tests)
 * @param ip - Client IP for audit log
 */
export async function requestReset(
  email: string,
  emailService: IEmailService,
  ip: string,
  appBaseUrl: string
): Promise<void> {
  const normalisedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalisedEmail } });

  if (!user) return; // Silent — prevents enumeration

  // Invalidate any previous unexpired reset tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`;
  await emailService.sendPasswordReset(normalisedEmail, resetUrl);

  auditLog("PASSWORD_RESET_REQUESTED", user.id, ip);
}

/**
 * Completes a password reset using a valid single-use token.
 * Updates the password, marks the token as used, and revokes all active sessions (FR-007).
 * Emits PASSWORD_RESET_COMPLETED audit log (FR-011).
 *
 * @param rawToken - Raw reset token from the email link
 * @param newPassword - New plaintext password (validated by caller)
 * @param ip - Client IP for audit log
 * @throws {InvalidResetTokenError} If token is invalid, expired, or already used
 */
export async function completeReset(
  rawToken: string,
  newPassword: string,
  ip: string
): Promise<void> {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    throw new InvalidResetTokenError();
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  auditLog("PASSWORD_RESET_COMPLETED", resetToken.userId, ip);
}
