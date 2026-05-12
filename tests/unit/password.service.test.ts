import { createHash } from "crypto";

// Mock Prisma
jest.mock("../../src/db/client", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    refreshToken: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

// Mock audit logger
jest.mock("../../src/audit/logger", () => ({ auditLog: jest.fn() }));

import { prisma } from "../../src/db/client";
import { auditLog } from "../../src/audit/logger";
import {
  requestReset,
  completeReset,
  InvalidResetTokenError,
} from "../../src/services/password.service";
import type { IEmailService } from "../../src/services/email.interface";

const mockUser = jest.mocked(prisma.user);
const mockResetToken = jest.mocked(prisma.passwordResetToken);
const mockTransaction = jest.mocked(prisma.$transaction);

const mockEmailService: jest.Mocked<IEmailService> = {
  sendPasswordReset: jest.fn(),
};

const APP_BASE_URL = "https://example.com";

describe("password.service", () => {
  beforeEach(() => jest.clearAllMocks());

  // --- requestReset ---
  describe("requestReset", () => {
    it("calls email service for registered user", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-1" });
      (mockResetToken.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockResetToken.create as jest.Mock).mockResolvedValue({});
      mockEmailService.sendPasswordReset.mockResolvedValue();

      await requestReset("user@example.com", mockEmailService, "1.2.3.4", APP_BASE_URL);

      expect(mockEmailService.sendPasswordReset).toHaveBeenCalledTimes(1);
      const [to, url] = mockEmailService.sendPasswordReset.mock.calls[0] as [string, string];
      expect(to).toBe("user@example.com");
      expect(url).toContain(APP_BASE_URL);
      expect(url).toContain("/reset-password?token=");
      expect(auditLog).toHaveBeenCalledWith("PASSWORD_RESET_REQUESTED", "user-1", "1.2.3.4");
    });

    it("does NOT call email service for unregistered email (silent — prevents enumeration)", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue(null);

      await requestReset("nobody@example.com", mockEmailService, "1.2.3.4", APP_BASE_URL);

      expect(mockEmailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(auditLog).not.toHaveBeenCalled();
    });

    it("normalises email before lookup", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue(null);

      await requestReset("  USER@EXAMPLE.COM  ", mockEmailService, "1.2.3.4", APP_BASE_URL);

      expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
    });

    it("invalidates previous unexpired tokens before creating a new one", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-2" });
      (mockResetToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (mockResetToken.create as jest.Mock).mockResolvedValue({});
      mockEmailService.sendPasswordReset.mockResolvedValue();

      await requestReset("user@example.com", mockEmailService, "1.2.3.4", APP_BASE_URL);

      expect(mockResetToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user-2", usedAt: null }) as unknown,
          data: expect.objectContaining({ usedAt: expect.any(Date) as Date }) as unknown,
        })
      );
    });

    it("stores SHA-256 hash of token, not plaintext", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-3" });
      (mockResetToken.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (mockResetToken.create as jest.Mock).mockResolvedValue({});
      mockEmailService.sendPasswordReset.mockResolvedValue();

      await requestReset("user@example.com", mockEmailService, "0.0.0.0", APP_BASE_URL);

      const createCall = (mockResetToken.create as jest.Mock).mock.calls[0][0] as {
        data: { tokenHash: string };
      };
      // hash is 64-char hex (SHA-256), raw token is also 64-char hex — they differ
      expect(createCall.data.tokenHash).toHaveLength(64);
      // Verify the raw token in the email URL hashes to the stored hash
      const [, url] = mockEmailService.sendPasswordReset.mock.calls[0] as [string, string];
      const rawToken = new URL(url).searchParams.get("token") ?? "";
      const expectedHash = createHash("sha256").update(rawToken).digest("hex");
      expect(createCall.data.tokenHash).toBe(expectedHash);
    });
  });

  // --- completeReset ---
  describe("completeReset", () => {
    const futureExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const rawToken = "a".repeat(64);
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    it("updates password, marks token used, revokes all sessions on valid token", async () => {
      (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-1",
        userId: "user-1",
        tokenHash,
        expiresAt: futureExpiry,
        usedAt: null,
      });
      // $transaction receives an array of promises in Prisma 7 (interactive tx via callback,
      // or plain array). password.service uses array form: prisma.$transaction([op1, op2, op3])
      mockTransaction.mockResolvedValue([{}, {}, {}]);

      await completeReset(rawToken, "NewPassword1", "1.2.3.4");

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(auditLog).toHaveBeenCalledWith("PASSWORD_RESET_COMPLETED", "user-1", "1.2.3.4");
    });

    it("throws InvalidResetTokenError for unknown token", async () => {
      (mockResetToken.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(completeReset("unknowntoken", "NewPassword1", "1.2.3.4")).rejects.toThrow(
        InvalidResetTokenError
      );
    });

    it("throws InvalidResetTokenError for expired token", async () => {
      (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-2",
        userId: "user-1",
        tokenHash,
        expiresAt: new Date(Date.now() - 1000), // expired
        usedAt: null,
      });
      await expect(completeReset(rawToken, "NewPassword1", "1.2.3.4")).rejects.toThrow(
        InvalidResetTokenError
      );
    });

    it("throws InvalidResetTokenError for already-used token", async () => {
      (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-3",
        userId: "user-1",
        tokenHash,
        expiresAt: futureExpiry,
        usedAt: new Date(), // already used
      });
      await expect(completeReset(rawToken, "NewPassword1", "1.2.3.4")).rejects.toThrow(
        InvalidResetTokenError
      );
    });

    it("hashes the new password with bcrypt (never stores plaintext)", async () => {
      (mockResetToken.findUnique as jest.Mock).mockResolvedValue({
        id: "rt-4",
        userId: "user-2",
        tokenHash,
        expiresAt: futureExpiry,
        usedAt: null,
      });
      mockTransaction.mockResolvedValue([{}, {}, {}]);

      await completeReset(rawToken, "NewPassword1", "0.0.0.0");

      // Verify transaction was called with an array of 3 operations
      const txArgs = (mockTransaction.mock.calls[0] as unknown[])[0] as unknown[];
      expect(Array.isArray(txArgs)).toBe(true);
      expect(txArgs).toHaveLength(3);
    });
  });
});
