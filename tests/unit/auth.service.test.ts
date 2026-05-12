import bcrypt from "bcrypt";

// Mock Prisma client
jest.mock("../../src/db/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    refreshToken: {
      updateMany: jest.fn(),
    },
  },
}));

// Mock audit logger
jest.mock("../../src/audit/logger", () => ({
  auditLog: jest.fn(),
}));

import { prisma } from "../../src/db/client";
import { auditLog } from "../../src/audit/logger";
import { register, login, logout, logoutAll, DuplicateEmailError, InvalidCredentialsError } from "../../src/services/auth.service";

const mockUser = jest.mocked(prisma.user);
const mockRefreshToken = jest.mocked(prisma.refreshToken);

describe("auth.service", () => {
  beforeEach(() => jest.clearAllMocks());

  // --- register ---
  describe("register", () => {
    it("creates user with normalised email and bcrypt hash", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue(null);
      (mockUser.create as jest.Mock).mockResolvedValue({ id: "user-1" });

      const userId = await register(" Test@Example.COM ", "Password1", "1.2.3.4");

      expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
      const createCall = (mockUser.create as jest.Mock).mock.calls[0][0] as { data: { email: string; passwordHash: string } };
      expect(createCall.data.email).toBe("test@example.com");
      const hashValid = await bcrypt.compare("Password1", createCall.data.passwordHash);
      expect(hashValid).toBe(true);
      expect(userId).toBe("user-1");
      expect(auditLog).toHaveBeenCalledWith("REGISTER", "user-1", "1.2.3.4");
    });

    it("throws DuplicateEmailError if email already exists", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });
      await expect(register("test@example.com", "Password1", "1.2.3.4")).rejects.toThrow(DuplicateEmailError);
    });

    it("never stores plaintext password", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue(null);
      (mockUser.create as jest.Mock).mockResolvedValue({ id: "u1" });
      await register("a@b.com", "MySecret1", "0.0.0.0");
      const createCall = (mockUser.create as jest.Mock).mock.calls[0][0] as { data: { passwordHash: string } };
      expect(createCall.data.passwordHash).not.toBe("MySecret1");
    });
  });

  // --- login ---
  describe("login", () => {
    it("returns userId on valid credentials", async () => {
      const hash = await bcrypt.hash("Password1", 12);
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-2", passwordHash: hash });
      const userId = await login("user@example.com", "Password1", "1.2.3.4");
      expect(userId).toBe("user-2");
      expect(auditLog).toHaveBeenCalledWith("LOGIN_SUCCESS", "user-2", "1.2.3.4");
    });

    it("throws InvalidCredentialsError on wrong password", async () => {
      const hash = await bcrypt.hash("CorrectPass1", 12);
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "user-3", passwordHash: hash });
      await expect(login("user@example.com", "WrongPass1", "1.2.3.4")).rejects.toThrow(InvalidCredentialsError);
      expect(auditLog).toHaveBeenCalledWith("LOGIN_FAILURE", "user-3", "1.2.3.4");
    });

    it("throws InvalidCredentialsError on unknown email (identical to wrong password)", async () => {
      (mockUser.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(login("unknown@example.com", "Password1", "1.2.3.4")).rejects.toThrow(InvalidCredentialsError);
    });

    it("normalises email before lookup", async () => {
      const hash = await bcrypt.hash("Password1", 12);
      (mockUser.findUnique as jest.Mock).mockResolvedValue({ id: "u4", passwordHash: hash });
      await login(" USER@EXAMPLE.COM ", "Password1", "0.0.0.0");
      expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { email: "user@example.com" } });
    });
  });

  // --- logout ---
  describe("logout", () => {
    it("revokes only the specified refresh token", async () => {
      (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      await logout("user-1", "hash-abc", "1.2.3.4");
      expect(mockRefreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", tokenHash: "hash-abc", revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(auditLog).toHaveBeenCalledWith("LOGOUT", "user-1", "1.2.3.4");
    });
  });

  // --- logoutAll ---
  describe("logoutAll", () => {
    it("revokes all active tokens for the user", async () => {
      (mockRefreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });
      await logoutAll("user-2", "10.0.0.1");
      expect(mockRefreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-2", revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(auditLog).toHaveBeenCalledWith("LOGOUT_ALL", "user-2", "10.0.0.1");
    });
  });
});
