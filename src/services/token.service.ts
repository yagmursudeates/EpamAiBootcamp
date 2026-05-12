import { createHash, randomBytes, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../db/client";
import { auditLog } from "../audit/logger";
import { env } from "../config/env";

const ACCESS_TOKEN_TTL_SECONDS = 86400; // 24 hours
const REFRESH_TOKEN_TTL_DAYS = 7;

/** Error thrown when a refresh token is invalid, expired, or revoked. */
export class InvalidRefreshTokenError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "InvalidRefreshTokenError";
  }
}

/** Error thrown when a token reuse attack is detected. */
export class TokenReuseDetectedError extends Error {
  constructor() {
    super("Invalid credentials");
    this.name = "TokenReuseDetectedError";
  }
}

/**
 * Issues a signed RS256 JWT access token with required claims (FR-003).
 * Claims included: sub, iat, exp, jti.
 *
 * @param userId - Subject user's ID
 * @returns Signed JWT string
 */
export function issueAccessToken(userId: string): string {
  const privateKey = env.JWT_PRIVATE_KEY.replace(/\\n/g, "\n");
  return jwt.sign({ sub: userId, jti: randomUUID() }, privateKey, {
    algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

/**
 * Issues a new refresh token, stores its SHA-256 hash in the database (FR-004).
 *
 * @param userId - Subject user's ID
 * @returns Raw refresh token (64-char hex) — only returned once
 */
export async function issueRefreshToken(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

/**
 * Rotates a refresh token: verifies the presented token, detects reuse attacks,
 * revokes the old token, and issues a new token pair (FR-004).
 *
 * If the token is already revoked (reuse attack), ALL tokens for the user are
 * revoked immediately and a TokenReuseDetectedError is thrown (FR-004).
 *
 * @param rawToken - Raw refresh token presented by the client
 * @param ip - Client IP for audit log
 * @returns New access token and refresh token pair
 * @throws {TokenReuseDetectedError} If the token has already been rotated (theft signal)
 * @throws {InvalidRefreshTokenError} If the token is invalid or expired
 */
export async function rotateRefreshToken(
  rawToken: string,
  ip: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing) throw new InvalidRefreshTokenError();

  // Detect token reuse: already revoked = theft signal (FR-004)
  if (existing.revokedAt !== null) {
    await prisma.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    auditLog("TOKEN_REUSE_DETECTED", existing.userId, ip);
    throw new TokenReuseDetectedError();
  }

  if (existing.expiresAt < new Date()) throw new InvalidRefreshTokenError();

  // Revoke old token and issue new pair
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const accessToken = issueAccessToken(existing.userId);
  const newRefreshToken = await issueRefreshToken(existing.userId);

  auditLog("TOKEN_REFRESH", existing.userId, ip);

  return { accessToken, refreshToken: newRefreshToken };
}
