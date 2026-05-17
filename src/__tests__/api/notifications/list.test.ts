import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/notifications/route';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { insertTestNotification } from '../../helpers/notifications';
import { mockSession } from '../../helpers/auth';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T038: GET /api/notifications (US-005 AC-1, AC-2, AC-3, AC-7) ─────────────

describe('GET /api/notifications', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mocked(getDb).mockReturnValue(db);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return 200 with notification objects (id, message, is_read, created_at) for the authenticated user only', async () => {
    // Arrange — AC-1
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    const otherUser = await createTestUser(db, { id: 'user-2', email: 'user2@epam.com' });
    const myNotif = insertTestNotification(db, user.id, { message: 'Your idea was accepted' });
    insertTestNotification(db, otherUser.id, { message: 'Other user notification' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: user.id }));

    const request = new NextRequest('http://localhost/api/notifications');

    // Act
    const response = await GET(request);
    const body = await response.json();

    // Assert — derived from US-005 AC-1
    expect(response.status).toBe(200);
    expect(body.notifications).toHaveLength(1);
    expect(body.notifications[0].id).toBe(myNotif.id);
    expect(body.notifications[0]).toHaveProperty('message');
    expect(body.notifications[0]).toHaveProperty('is_read');
    expect(body.notifications[0]).toHaveProperty('created_at');
  });

  it('should not include notifications belonging to a different user in the same database', async () => {
    // Arrange — AC-2: isolation
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    const otherUser = await createTestUser(db, { id: 'user-2', email: 'user2@epam.com' });
    insertTestNotification(db, otherUser.id);
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: user.id }));

    const request = new NextRequest('http://localhost/api/notifications');

    // Act
    const response = await GET(request);
    const body = await response.json();

    // Assert — derived from US-005 AC-2
    expect(response.status).toBe(200);
    expect(body.notifications).toHaveLength(0);
  });

  it('should return 200 with an empty array when the authenticated user has no notifications', async () => {
    // Arrange — AC-3
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: user.id }));

    const request = new NextRequest('http://localhost/api/notifications');

    // Act
    const response = await GET(request);
    const body = await response.json();

    // Assert — derived from US-005 AC-3
    expect(response.status).toBe(200);
    expect(body.notifications).toEqual([]);
  });

  it('should return 401 when the request is unauthenticated', async () => {
    // Arrange — AC-7
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/notifications');

    // Act
    const response = await GET(request);

    // Assert — derived from US-005 AC-7
    expect(response.status).toBe(401);
  });
});
