import { createHash } from "crypto";

// Mock Prisma
jest.mock("../../src/db/client", () => ({
  prisma: {
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

// Mock audit logger
jest.mock("../../src/audit/logger", () => ({ auditLog: jest.fn() }));

// Mock env
jest.mock("../../src/config/env", () => ({
  env: {
    JWT_PRIVATE_KEY: "secret",
    JWT_PUBLIC_KEY: "secret",
    JWT_ALGORITHM: "HS256",
  },
}));

import { prisma } from "../../src/db/client";
import { auditLog } from "../../src/audit/logger";
import {
  issueAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  InvalidRefreshTokenError,
  TokenReuseDetectedError,
} from "../../src/services/token.service";
import jwt from "jsonwebtoken";

const mockRefreshToken = jest.mocked(prisma.refreshToken);

describe("token.service", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("issueAccessToken", () => {
    it("returns a JWT with required claims (sub, jti, iat, exp)", () => {
      const token = issueAccessToken("user-1");
      const payload = jwt.decode(token) as Record<string, unknown>;
      expect(payload["sub"]).toBe("user-1");
      expect(payload["jti"]).toBeDefined();
      expect(payload["iat"]).toBeDefined();
      expect(payload["exp"]).toBeDefined();
    });

    it("token expires in approximately 24 hours", () => {
      const token = issueAccessToken("user-1");
      const payload = jwt.decode(token) as { iat: number; exp: number };
      expect(payload.exp - payload.iat).toBe(86400);
    });
  });

  describe("issueRefreshToken", () => {
    it("stores SHA-256 hash, not plaintext token", async () => {
      (mockRefreshToken.create as jest.Mock).mockResolvedValue({});
      const rawToken = await issueRefreshToken("user-1");
      const createCall = (mockRefreshToken.create as jest.Mock).mock.calls[0][0] as {
        data: { userId: string; tokenHash: string };
      };
      const expectedHash = createHash("sha256").update(rawToken).digest("hex");
      expect(createCall.data.tokenHash).toBe(expectedHash);
      expect(createCall.data.tokenHash).not.toBe(rawToken);
    });
  });

  describe("rotateRefreshToken", () => {
    const now = new Date();
    const futureExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    it("issues new token pair on valid token", async () => {
      (mockRefreshToken.create as jest.Mock).mockResolvedValue({});
      const rawToken = "a".repeat(64);
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        tokenHash,
        revokedAt: null,
        expiresAt: futureExpiry,
      });
      (mockRefreshToken.update as jest.Mock).mockResolvedValue({});

      const result = await rotateRefreshToken(rawToken, "1.2.3.4");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(auditLog).toHaveBeenCalledWith("TOKEN_REFRESH", "user-1", "1.2.3.4");
    });

    it("throws InvalidRefreshTokenError for unknown token", async () => {
      (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(rotateRefreshToken("unknowntoken", "1.2.3.4")).rejects.toThrow(InvalidRefreshTokenError);
    });

    it("throws InvalidRefreshTokenError for expired token", async () => {
      const rawToken = "b".repeat(64);
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-2",
        userId: "user-1",
        tokenHash,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000), // expired
      });
      await expect(rotateRefreshToken(rawToken, "1.2.3.4")).rejects.toThrow(InvalidRefreshTokenError);
    });

    it("detects reuse: revokes ALL tokens + throws TokenReuseDetectedError", async () => {
      const rawToken = "c".repeat(64);
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      (mockRefreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-3",
        userId: "user-2",
        tokenHash,
        revokedAt: new Date(), // already revoked
        expiresAt: futureExpiry,
      });
      (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      await expect(rotateRefreshToken(rawToken, "9.9.9.9")).rejects.toThrow(TokenReuseDetectedError);
      expect(mockRefreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-2", revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(auditLog).toHaveBeenCalledWith("TOKEN_REUSE_DETECTED", "user-2", "9.9.9.9");
    });
  });
});
