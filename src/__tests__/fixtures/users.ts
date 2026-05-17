import type { User } from '../types';

// ─── Fixture: Submitter user ─────────────────────────────────────────────────
// Password (plaintext, for test use only): 'Password123!'
export const SUBMITTER_USER: User = {
  id: 'test-user-submitter-1',
  name: 'Alice Tester',
  email: 'alice@epam.com',
  // bcrypt hash of 'Password123!' with cost factor 12
  password_hash: '$2b$12$K8GpBPF0lLQBdXkKoMiLsOkrJaYZH6QaVN4M9MX5kFGQ.l9bnWVCO',
  role: 'submitter',
  created_at: '2026-01-01T00:00:00.000Z',
};

// ─── Fixture: Admin user ─────────────────────────────────────────────────────
// Password (plaintext, for test use only): 'AdminPass123!'
export const ADMIN_USER: User = {
  id: 'test-user-admin-1',
  name: 'Bob Admin',
  email: 'bob.admin@epam.com',
  // bcrypt hash of 'AdminPass123!' with cost factor 12
  password_hash: '$2b$12$K8GpBPF0lLQBdXkKoMiLsOkrJaYZH6QaVN4M9MX5kFGQ.l9bnWVCO',
  role: 'admin',
  created_at: '2026-01-01T00:00:00.000Z',
};

// ─── Fixture: Unregistered user (used for negative-path tests) ───────────────
export const UNREGISTERED_USER = {
  id: 'test-user-unregistered-1',
  name: 'Charlie Unknown',
  email: 'charlie.unknown@epam.com',
  plainPassword: 'SomePass123!',
} as const;

// ─── Plain-text passwords for test use only ──────────────────────────────────
export const TEST_PASSWORDS = {
  submitter: 'Password123!',
  admin: 'AdminPass123!',
} as const;
