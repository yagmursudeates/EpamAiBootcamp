import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/register/route';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { mockSession } from '../../helpers/auth';
import { SUBMITTER_USER } from '../../fixtures/users';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T013: POST /api/auth/register (US-001 AC-1, AC-2) ──────────────────────

describe('POST /api/auth/register', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createTestDb();
    // Inject the test DB into the route handler
    vi.mocked(getDb).mockReturnValue(db);
    vi.mocked(getServerSession).mockResolvedValue(null);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return 201 and create a user with role submitter for a valid payload', async () => {
    // Arrange — AC-1
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: SUBMITTER_USER.name,
        email: SUBMITTER_USER.email,
        password: 'Password123!',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert — derived from US-001 AC-1: "account is created with role submitter"
    expect(response.status).toBe(201);
    expect(body.user.role).toBe('submitter');
    expect(body.user.email).toBe(SUBMITTER_USER.email);
  });

  it('should return 409 when the email already exists in the database', async () => {
    // Arrange — AC-2
    const payload = {
      name: SUBMITTER_USER.name,
      email: SUBMITTER_USER.email,
      password: 'Password123!',
    };
    // First registration succeeds
    await POST(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Act — second registration with same email
    const response = await POST(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Assert — derived from US-001 AC-2: "duplicate email returns 409"
    expect(response.status).toBe(409);
  });

  it('should return 422 when Zod validation fails on the request body', async () => {
    // Arrange — invalid payload (password too short)
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice', email: 'alice@epam.com', password: 'short' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(422);
  });

  it('should store password as a bcrypt hash and never persist plaintext', async () => {
    // Arrange — security requirement from US-001 technical notes
    const plainPassword = 'Password123!';
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: SUBMITTER_USER.name,
        email: SUBMITTER_USER.email,
        password: plainPassword,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    await POST(request);
    const row = db.prepare('SELECT password_hash FROM users WHERE email = ?')
      .get(SUBMITTER_USER.email) as { password_hash: string };

    // Assert
    expect(row.password_hash).not.toBe(plainPassword);
    expect(row.password_hash).toMatch(/^\$2b\$/);
  });
});
