import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/notifications/route';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { insertTestNotification } from '../../helpers/notifications';
import { mockSession } from '../../helpers/auth';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T040: PATCH /api/notifications — bulk mark-read (US-005 AC-6, AC-2, AC-7) ─

describe('PATCH /api/notifications (bulk mark-read)', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mocked(getDb).mockReturnValue(db);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return 200 and set is_read = 1 for all notifications belonging to the authenticated user', async () => {
    // Arrange — AC-6
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    insertTestNotification(db, user.id, { is_read: 0 });
    insertTestNotification(db, user.id, { is_read: 0 });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: user.id }));

    const request = new NextRequest('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });

    // Act
    const response = await PATCH(request);
    const body = await response.json();

    // Assert — derived from US-005 AC-6
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);

    const unread = db
      .prepare('SELECT count(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0')
      .get(user.id) as { cnt: number };
    expect(unread.cnt).toBe(0);
  });

  it('should not modify notifications belonging to a different user', async () => {
    // Arrange — AC-2: isolation between users
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    const otherUser = await createTestUser(db, { id: 'user-2', email: 'user2@epam.com' });
    const otherNotif = insertTestNotification(db, otherUser.id, { is_read: 0 });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: user.id }));

    const request = new NextRequest('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });

    // Act
    await PATCH(request);

    // Assert — derived from US-005 AC-2: other user's notification is untouched
    const row = db
      .prepare('SELECT is_read FROM notifications WHERE id = ?')
      .get(otherNotif.id) as { is_read: number };
    expect(row.is_read).toBe(0);
  });

  it('should return 401 when the request is unauthenticated', async () => {
    // Arrange — AC-7
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });

    // Act
    const response = await PATCH(request);

    // Assert — derived from US-005 AC-7
    expect(response.status).toBe(401);
  });
});
