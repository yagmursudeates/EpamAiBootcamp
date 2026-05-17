import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { User, UserRole } from '../types';
import { SUBMITTER_USER, TEST_PASSWORDS } from '../fixtures/users';

export interface CreateTestUserOptions {
  id?: string;
  name?: string;
  email?: string;
  plainPassword?: string;
  role?: UserRole;
}

/**
 * Inserts a user with a bcrypt-hashed password into the test database.
 * Uses SUBMITTER_USER fixture as base; override any field via options.
 *
 * Constitution §6 — Helpers: createTestUser() in src/__tests__/helpers/.
 */
export async function createTestUser(
  db: Database.Database,
  options: CreateTestUserOptions = {}
): Promise<User> {
  const plainPassword = options.plainPassword ?? TEST_PASSWORDS.submitter;
  const password_hash = await bcrypt.hash(plainPassword, 10);

  const user: User = {
    id: options.id ?? uuidv4(),
    name: options.name ?? SUBMITTER_USER.name,
    email: options.email ?? SUBMITTER_USER.email,
    password_hash,
    role: options.role ?? 'submitter',
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, created_at)
    VALUES (@id, @name, @email, @password_hash, @role, @created_at)
  `).run(user);

  return user;
}
