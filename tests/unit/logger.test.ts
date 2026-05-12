import { createHash } from "crypto";
import { auditLog, AuditEvent } from "../../src/audit/logger";
import { logger } from "../../src/audit/logger";

describe("auditLog", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(logger, "log").mockImplementation(() => logger);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("emits a JSON entry with mandatory fields", () => {
    auditLog("LOGIN_SUCCESS", "user-123", "127.0.0.1");
    expect(logSpy).toHaveBeenCalledTimes(1);
    const [level, entry] = logSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(level).toBe("info");
    expect(entry).toHaveProperty("event", "LOGIN_SUCCESS");
    expect(entry).toHaveProperty("timestamp");
    expect(entry).toHaveProperty("userId");
    expect(entry).toHaveProperty("ip", "127.0.0.1");
    expect(entry).toHaveProperty("level", "info");
  });

  it("hashes the userId with SHA-256 (non-reversible)", () => {
    const rawId = "user-456";
    auditLog("REGISTER", rawId, "10.0.0.1");
    const [, entry] = logSpy.mock.calls[0] as [string, Record<string, unknown>];
    const expected = createHash("sha256").update(rawId).digest("hex");
    expect(entry["userId"]).toBe(expected);
    expect(entry["userId"]).not.toBe(rawId);
  });

  it("uses warn level for LOGIN_FAILURE", () => {
    auditLog("LOGIN_FAILURE", "user-789", "10.0.0.2");
    const [level] = logSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(level).toBe("warn");
  });

  it("uses warn level for TOKEN_REUSE_DETECTED", () => {
    auditLog("TOKEN_REUSE_DETECTED", "user-abc", "10.0.0.3");
    const [level] = logSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(level).toBe("warn");
  });

  it("never includes email, password, or plaintext token in payload", () => {
    auditLog("LOGIN_SUCCESS", "user-123", "127.0.0.1");
    const [, entry] = logSpy.mock.calls[0] as [string, Record<string, unknown>];
    const keys = Object.keys(entry);
    expect(keys).not.toContain("email");
    expect(keys).not.toContain("password");
    expect(keys).not.toContain("token");
  });

  const events: AuditEvent[] = [
    "REGISTER", "LOGIN_SUCCESS", "LOGIN_FAILURE", "PASSWORD_RESET_REQUESTED",
    "PASSWORD_RESET_COMPLETED", "TOKEN_REFRESH", "TOKEN_REUSE_DETECTED",
    "LOGOUT", "LOGOUT_ALL", "TOKEN_REVOCATION", "EMAIL_DELIVERY_FAILED",
  ];

  it.each(events)("emits audit log for event: %s", (event) => {
    auditLog(event, "uid", "1.1.1.1");
    expect(logSpy).toHaveBeenCalledTimes(1);
    const [, entry] = logSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(entry["event"]).toBe(event);
  });
});
