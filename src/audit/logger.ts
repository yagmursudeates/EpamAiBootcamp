import { createHash } from "crypto";
import winston from "winston";

/** Audit event types emitted by the authentication system (FR-011). */
export type AuditEvent =
  | "REGISTER"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "TOKEN_REFRESH"
  | "TOKEN_REUSE_DETECTED"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "TOKEN_REVOCATION"
  | "EMAIL_DELIVERY_FAILED";

/** Mandatory fields for every audit log entry (FR-011). */
interface AuditLogEntry {
  event: AuditEvent;
  timestamp: string;
  /** SHA-256 hex of the internal user UUID — non-reversible (FR-011). */
  userId: string;
  ip: string;
  level: "info" | "warn" | "error";
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

/**
 * Emits a structured JSON audit log entry for a security event.
 * Payloads never contain passwords, plaintext tokens, email addresses,
 * or any PII beyond the non-reversible userId hash (FR-011).
 *
 * @param event - The security event type
 * @param rawUserId - Internal user UUID (will be SHA-256 hashed before logging)
 * @param ip - Client IP address
 */
export function auditLog(event: AuditEvent, rawUserId: string, ip: string): void {
  const entry: AuditLogEntry = {
    event,
    timestamp: new Date().toISOString(),
    userId: createHash("sha256").update(rawUserId).digest("hex"),
    ip,
    level: event === "LOGIN_FAILURE" || event === "TOKEN_REUSE_DETECTED" ? "warn" : "info",
  };
  logger.log(entry.level, entry);
}

export { logger };
