import nodemailer from "nodemailer";
import type { IEmailService } from "./email.interface";
import { EmailDeliveryError } from "./email.interface";
import { env } from "../config/env";
import { auditLog } from "../audit/logger";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Default nodemailer-based email service implementation.
 * Wraps delivery in an async retry loop (up to 3 attempts, exponential backoff).
 * On exhaustion emits EMAIL_DELIVERY_FAILED audit log and resolves silently (FR-012).
 */
export class NodemailerEmailService implements IEmailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  /**
   * Sends a password reset email with retry logic (FR-012).
   *
   * @param to - Recipient email address
   * @param resetUrl - Full password reset URL containing the raw token
   */
  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.transporter.sendMail({
          from: env.EMAIL_FROM,
          to,
          subject: "Reset your password",
          text: `Click the link below to reset your password (expires in 15 minutes):\n\n${resetUrl}`,
          html: `<p>Click <a href="${resetUrl}">here</a> to reset your password (expires in 15 minutes).</p>`,
        });
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < MAX_RETRIES) {
          await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1));
        }
      }
    }

    // All retries exhausted — log audit event, resolve silently (FR-012)
    auditLog("EMAIL_DELIVERY_FAILED", "system", "system");
    throw new EmailDeliveryError(to, MAX_RETRIES, lastError);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
