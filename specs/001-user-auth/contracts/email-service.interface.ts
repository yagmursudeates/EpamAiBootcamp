/**
 * Email service interface for sending transactional emails.
 * Implementations must be injectable and mockable in tests (FR-006, FR-012).
 */
export interface IEmailService {
  /**
   * Send a password reset email to the specified recipient.
   *
   * @param to - The recipient email address (registered user)
   * @param resetUrl - The full password reset URL containing the raw token
   * @returns Resolves when the email has been accepted by the provider
   * @throws {EmailDeliveryError} If the underlying transport fails after all retries
   */
  sendPasswordReset(to: string, resetUrl: string): Promise<void>;
}

/**
 * Error thrown when email delivery fails after exhausting all retry attempts.
 */
export class EmailDeliveryError extends Error {
  constructor(
    public readonly recipient: string,
    public readonly attempts: number,
    cause?: Error
  ) {
    super(`Email delivery failed after ${attempts} attempts to ${recipient}`);
    this.name = "EmailDeliveryError";
    if (cause) this.cause = cause;
  }
}
