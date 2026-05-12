/**
 * Integration tests for auth routes (T023, T031, T040, T049).
 * Uses supertest with a mocked Prisma client and email service.
 * No real database or SMTP required.
 */

// --- Mocks (must be declared before imports) ---

// Mock rate limiters as pass-through in tests
jest.mock("../../src/middleware/rate-limit", () => ({
  ipRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  accountRateLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

jest.mock("../../src/db/client", () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    passwordResetToken: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock("../../src/audit/logger", () => ({ auditLog: jest.fn() }));

jest.mock("../../src/config/env", () => ({
  env: {
    JWT_PRIVATE_KEY: "test-secret",
    JWT_PUBLIC_KEY: "test-secret",
    JWT_ALGORITHM: "HS256",
    APP_BASE_URL: "https://example.com",
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: 587,
    SMTP_USER: "user",
    SMTP_PASS: "pass",
    EMAIL_FROM: "no-reply@example.com",
    PORT: 3000,
    NODE_ENV: "test",
  },
}));

// Mock the email service so nodemailer is never called
const mockSendPasswordReset = jest.fn().mockResolvedValue(undefined);
jest.mock("../../src/services/email.service", () => ({
  NodemailerEmailService: jest.fn().mockImplementation(() => ({
    sendPasswordReset: mockSendPasswordReset,
  })),
}));

import request from "supertest";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { createApp } from "../../src/app";
import { prisma } from "../../src/db/client";

const app = createApp();

const mockUser = jest.mocked(prisma.user);
const mockRefreshToken = jest.mocked(prisma.refreshToken);
const mockResetToken = jest.mocked(prisma.passwordResetToken);

// Helper: create a signed HS256 JWT for a user
function makeAccessToken(userId: string): string {
  return jwt.sign({ sub: userId, jti: "test-jti" }, "test-secret", {
    algorithm: "HS256",
    expiresIn: 86400,
  });
}

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────
// T023 — POST /auth/register
// ─────────────────────────────────────────────
describe("POST /auth/register", () => {
  it("returns 201 on valid registration", async () => {
    (mockUser.findUnique as jest.Mock).mockResolvedValue(null);
    (mockUser.create as jest.Mock).mockResolvedValue({ id: "user-1" });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "new@example.com", password: "Password1" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 409 for duplicate email", async () => {
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "existing@example.com", password: "Password1" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "not-an-email", password: "Password1" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("fields");
  });

  it("returns 400 when password lacks uppercase letter", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "user@example.com", password: "password1" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when password lacks number", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "user@example.com", password: "Password" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "user@example.com", password: "P1" });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// T031 — POST /auth/login
// ─────────────────────────────────────────────
describe("POST /auth/login", () => {
  it("returns 200 with accessToken and refreshToken on valid credentials", async () => {
    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash("Password1", 12);
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-1", passwordHash: hash });
    (mockRefreshToken.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "Password1" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("expiresIn", 86400);
  });

  it("returns 401 with generic message for wrong password (FR-008)", async () => {
    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash("CorrectPass1", 12);
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-2", passwordHash: hash });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "WrongPass1" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("returns 401 with identical message for unknown email (FR-008)", async () => {
    (mockUser.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "Password1" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("error message is identical for wrong password and unknown email (FR-008)", async () => {
    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash("CorrectPass1", 12);
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "u", passwordHash: hash });
    const wrongPassRes = await request(app)
      .post("/auth/login")
      .send({ email: "user@example.com", password: "WrongPass1" });

    (mockUser.findUnique as jest.Mock).mockResolvedValue(null);
    const unknownEmailRes = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@example.com", password: "Password1" });

    expect(wrongPassRes.body).toEqual(unknownEmailRes.body);
  });

  it("returns 400 for missing email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "Password1" });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// POST /auth/refresh
// ─────────────────────────────────────────────
describe("POST /auth/refresh", () => {
  it("returns 200 with new tokens on valid refresh token", async () => {
    const rawToken = "r".repeat(64);
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: "rt-1",
      userId: "user-1",
      tokenHash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    (mockRefreshToken.update as jest.Mock).mockResolvedValue({});
    (mockRefreshToken.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rawToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("returns 401 for unknown refresh token", async () => {
    (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "invalid" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid credentials" });
  });

  it("returns 401 and revokes all sessions on token reuse (FR-004)", async () => {
    const rawToken = "s".repeat(64);
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: "rt-2",
      userId: "user-2",
      tokenHash,
      revokedAt: new Date(), // already revoked
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rawToken });

    expect(res.status).toBe(401);
    expect(mockRefreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "user-2" }) as unknown })
    );
  });
});

// ─────────────────────────────────────────────
// POST /auth/logout and /auth/logout-all
// ─────────────────────────────────────────────
describe("POST /auth/logout", () => {
  it("returns 204 and revokes the current session token", async () => {
    const accessToken = makeAccessToken("user-1");
    const rawRefreshToken = "t".repeat(64);
    (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken: rawRefreshToken });

    expect(res.status).toBe(204);
    expect(mockRefreshToken.updateMany).toHaveBeenCalledTimes(1);
  });

  it("returns 401 without a valid JWT", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "sometoken" });

    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout-all", () => {
  it("returns 204 and revokes all sessions", async () => {
    const accessToken = makeAccessToken("user-1");
    (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

    const res = await request(app)
      .post("/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
    expect(mockRefreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "user-1" }) as unknown })
    );
  });

  it("returns 401 without a valid JWT", async () => {
    const res = await request(app).post("/auth/logout-all");
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// T040 — Password reset flow (end-to-end)
// ─────────────────────────────────────────────
describe("POST /auth/forgot-password", () => {
  it("always returns 200 regardless of whether email is registered (FR-006)", async () => {
    (mockUser.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "anyone@example.com" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 200 and dispatches email for registered user", async () => {
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" });
    (mockResetToken.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (mockResetToken.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "user@example.com" });

    expect(res.status).toBe(200);
    expect(mockSendPasswordReset).toHaveBeenCalled();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/reset-password", () => {
  const rawToken = "v".repeat(64);
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  it("returns 200 and updates password on valid token", async () => {
    (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "rt-1",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      usedAt: null,
    });
    (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}, {}]);

    const res = await request(app)
      .post("/auth/reset-password")
      .send({ token: rawToken, password: "NewPassword1" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("returns 400 for expired token", async () => {
    (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "rt-2",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
    });

    const res = await request(app)
      .post("/auth/reset-password")
      .send({ token: rawToken, password: "NewPassword1" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for already-used token", async () => {
    (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
      id: "rt-3",
      userId: "user-1",
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      usedAt: new Date(),
    });

    const res = await request(app)
      .post("/auth/reset-password")
      .send({ token: rawToken, password: "NewPassword1" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid token", async () => {
    (mockResetToken.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/reset-password")
      .send({ token: "badtoken", password: "NewPassword1" });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// T049 — Session lifecycle (multi-device)
// ─────────────────────────────────────────────
describe("Session lifecycle (multi-device — T049)", () => {
  it("logout revokes only current session; other device's refresh token still works", async () => {
    const bcrypt = await import("bcrypt");
    const hash = await bcrypt.hash("Password1", 12);

    // Device 1 logs in
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-multi", passwordHash: hash });
    (mockRefreshToken.create as jest.Mock).mockResolvedValue({});
    const loginRes1 = await request(app)
      .post("/auth/login")
      .send({ email: "multi@example.com", password: "Password1" });
    const { accessToken: at1, refreshToken: rt1 } = loginRes1.body as { accessToken: string; refreshToken: string };

    // Device 2 logs in
    (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-multi", passwordHash: hash });
    (mockRefreshToken.create as jest.Mock).mockResolvedValue({});
    const loginRes2 = await request(app)
      .post("/auth/login")
      .send({ email: "multi@example.com", password: "Password1" });
    const { refreshToken: rt2 } = loginRes2.body as { refreshToken: string };

    // Device 1 logs out
    (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    const logoutRes = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${at1}`)
      .send({ refreshToken: rt1 });
    expect(logoutRes.status).toBe(204);

    // Device 2's refresh token still works (different hash — not revoked)
    const rt2Hash = createHash("sha256").update(rt2).digest("hex");
    (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue({
      id: "rt-dev2",
      userId: "user-multi",
      tokenHash: rt2Hash,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    (mockRefreshToken.update as jest.Mock).mockResolvedValue({});
    (mockRefreshToken.create as jest.Mock).mockResolvedValue({});

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: rt2 });
    expect(refreshRes.status).toBe(200);
  });

  it("logout-all rejects all subsequent refresh attempts", async () => {
    const accessToken = makeAccessToken("user-all");
    (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

    const logoutAllRes = await request(app)
      .post("/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(logoutAllRes.status).toBe(204);

    // Any further refresh attempt should fail (token revoked)
    (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue(null);
    const refreshRes = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "anytoken" });
    expect(refreshRes.status).toBe(401);
  });
});
