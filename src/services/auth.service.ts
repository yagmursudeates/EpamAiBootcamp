import bcrypt from "bcrypt";
import { prisma } from "../db/client";
import { auditLog } from "../audit/logger";

const BCRYPT_COST = 12;

/** Typed error for duplicate email on registration. */
export class DuplicateEmailError extends Error {
  constructor() {
    super("Email already registered");
    this.name = "DuplicateEmailError";
  }
}

/** Typed error for invalid credentials on login. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}

/**
 * Registers a new user account.
 * Email is normalised (lowercased + trimmed) before storage (FR-001).
 * Password is hashed with bcrypt cost 12 (FR-002).
 * Emits REGISTER audit log event (FR-011).
 *
 * @param email - Raw email address from request
 * @param password - Plaintext password (validated by caller)
 * @param ip - Client IP for audit log
 * @returns The created user's ID
 * @throws {DuplicateEmailError} If email is already registered
 */
export async function register(email: string, password: string, ip: string): Promise<string> {
  const normalisedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalisedEmail } });
  if (existing) throw new DuplicateEmailError();

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await prisma.user.create({
    data: { email: normalisedEmail, passwordHash },
  });

  auditLog("REGISTER", user.id, ip);
  return user.id;
}

/**
 * Authenticates a user with email and password.
 * Returns identical error for wrong password and unknown email (FR-008).
 * Emits LOGIN_SUCCESS or LOGIN_FAILURE audit log event (FR-011).
 *
 * @param email - Raw email address from request
 * @param password - Plaintext password to verify
 * @param ip - Client IP for audit log
 * @returns The authenticated user's ID
 * @throws {InvalidCredentialsError} If credentials are invalid (generic — FR-008)
 */
export async function login(email: string, password: string, ip: string): Promise<string> {
  const normalisedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalisedEmail } });

  // Always compare to prevent timing attacks even if user not found
  const hash = user?.passwordHash ?? "$2b$12$invalidhashpadding000000000000000000000000000000000000000";
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    auditLog("LOGIN_FAILURE", user?.id ?? "unknown", ip);
    throw new InvalidCredentialsError();
  }

  auditLog("LOGIN_SUCCESS", user.id, ip);
  return user.id;
}

/**
 * Revokes the current session's refresh token for the given user.
 * Emits LOGOUT audit log event (FR-011).
 *
 * @param userId - Authenticated user's ID
 * @param tokenHash - SHA-256 hash of the refresh token to revoke
 * @param ip - Client IP for audit log
 */
export async function logout(userId: string, tokenHash: string, ip: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  auditLog("LOGOUT", userId, ip);
}

/**
 * Revokes all active refresh tokens for the given user (all devices).
 * Emits LOGOUT_ALL audit log event (FR-011, FR-013).
 *
 * @param userId - Authenticated user's ID
 * @param ip - Client IP for audit log
 */
export async function logoutAll(userId: string, ip: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  auditLog("LOGOUT_ALL", userId, ip);
}
