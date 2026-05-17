import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authorizeCredentials } from '@/lib/auth-credentials';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { ADMIN_USER, TEST_PASSWORDS } from '../../fixtures/users';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T014: NextAuth credentials provider (US-001 AC-3, AC-4) ─────────────────
// Tests the authorize() function extracted from auth.ts credentials provider.
// Constitution §6 — Fake: in-memory SQLite per suite.

describe('authorizeCredentials', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mocked(getDb).mockReturnValue(db);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return a user object with role submitter for valid submitter credentials', async () => {
    // Arrange — AC-3
    const user = await createTestUser(db, {
      email: 'alice@epam.com',
      plainPassword: TEST_PASSWORDS.submitter,
      role: 'submitter',
    });

    // Act
    const result = await authorizeCredentials({
      email: user.email,
      password: TEST_PASSWORDS.submitter,
    });

    // Assert — derived from US-001 AC-3
    expect(result).not.toBeNull();
    expect(result?.role).toBe('submitter');
    expect(result?.email).toBe(user.email);
  });

  it('should return a user object with role admin for valid admin credentials', async () => {
    // Arrange — AC-3
    await createTestUser(db, {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      plainPassword: TEST_PASSWORDS.admin,
      role: 'admin',
    });

    // Act
    const result = await authorizeCredentials({
      email: ADMIN_USER.email,
      password: TEST_PASSWORDS.admin,
    });

    // Assert — derived from US-001 AC-3: "admin redirected to /admin"
    expect(result).not.toBeNull();
    expect(result?.role).toBe('admin');
  });

  it('should return null when the password does not match the stored hash', async () => {
    // Arrange — AC-4
    const user = await createTestUser(db, { email: 'alice@epam.com' });

    // Act
    const result = await authorizeCredentials({
      email: user.email,
      password: 'WrongPassword999!',
    });

    // Assert — derived from US-001 AC-4: "no session is created"
    expect(result).toBeNull();
  });

  it('should return null when the email is not registered', async () => {
    // Arrange — AC-4 (no user in DB)

    // Act
    const result = await authorizeCredentials({
      email: 'notregistered@epam.com',
      password: 'Password123!',
    });

    // Assert
    expect(result).toBeNull();
  });
});
