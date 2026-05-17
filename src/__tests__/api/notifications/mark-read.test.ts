import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/notifications/[id]/route';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { insertTestNotification } from '../../helpers/notifications';
import { mockSession } from '../../helpers/auth';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T039: PATCH /api/notifications/[id] (US-005 AC-4, AC-5, AC-7) ───────────

describe('PATCH /api/notifications/[id]', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mocked(getDb).mockReturnValue(db);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return 200 with the updated notification where is_read is 1 when the owner marks it read', async () => {
    // Arrange — AC-4
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    const notif = insertTestNotification(db, user.id, { is_read: 0 });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: user.id }));

    const request = new NextRequest(`http://localhost/api/notifications/${notif.id}`, {
      method: 'PATCH',
    });

    // Act
    const response = await PATCH(request, { params: Promise.resolve({ id: notif.id }) });
    const body = await response.json();

    // Assert — derived from US-005 AC-4
    expect(response.status).toBe(200);
    expect(body.notification.id).toBe(notif.id);
    expect(body.notification.is_read).toBe(1);
  });

  it("should return 403 when the notification's user_id does not match the authenticated user", async () => {
    // Arrange — AC-5: IDOR prevention
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    const intruder = await createTestUser(db, { id: 'intruder-1', email: 'intruder@epam.com' });
    const notif = insertTestNotification(db, owner.id);
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: intruder.id }));

    const request = new NextRequest(`http://localhost/api/notifications/${notif.id}`, {
      method: 'PATCH',
    });

    // Act
    const response = await PATCH(request, { params: Promise.resolve({ id: notif.id }) });

    // Assert — derived from US-005 AC-5
    expect(response.status).toBe(403);
  });

  it('should return 401 when the request is unauthenticated', async () => {
    // Arrange — AC-7
    vi.mocked(getServerSession).mockResolvedValue(null);
    const user = await createTestUser(db, { id: 'user-1', email: 'user1@epam.com' });
    const notif = insertTestNotification(db, user.id);

    const request = new NextRequest(`http://localhost/api/notifications/${notif.id}`, {
      method: 'PATCH',
    });

    // Act
    const response = await PATCH(request, { params: Promise.resolve({ id: notif.id }) });

    // Assert — derived from US-005 AC-7
    expect(response.status).toBe(401);
  });
});
