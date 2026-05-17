import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ideas/[id]/evaluate/route';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { insertTestIdea } from '../../helpers/ideas';
import { mockSession, mockAdminSession } from '../../helpers/auth';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T034: POST /api/ideas/[id]/evaluate (US-004 AC-1 through AC-6, ADR-002) ──

describe('POST /api/ideas/[id]/evaluate', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mocked(getDb).mockReturnValue(db);
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession());
    // Admin must exist in the DB because evaluations.evaluator_id is a FK to users.id
    await createTestUser(db, { id: 'test-user-admin-1', email: 'admin@epam.com', role: 'admin' });
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return 200 with updated idea when admin evaluates with status "accepted"', async () => {
    // Arrange — AC-1, AC-2
    const submitter = await createTestUser(db, { id: 'submitter-1', email: 'sub@epam.com' });
    const idea = insertTestIdea(db, submitter.id, { title: 'Great idea' });
    const request = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted', notes: 'Excellent proposal' }),
    });

    // Act
    const response = await POST(request, { params: Promise.resolve({ id: idea.id }) });
    const body = await response.json();

    // Assert — derived from US-004 AC-1, AC-2
    expect(response.status).toBe(200);
    expect(body.idea.status).toBe('accepted');
    expect(body.idea.id).toBe(idea.id);
    expect(body.idea.evaluation_notes).toBe('Excellent proposal');
  });

  it('should return 200 with updated idea when admin evaluates with status "rejected"', async () => {
    // Arrange — AC-1
    const submitter = await createTestUser(db, { id: 'submitter-1', email: 'sub@epam.com' });
    const idea = insertTestIdea(db, submitter.id);
    const request = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', notes: 'Needs more research' }),
    });

    // Act
    const response = await POST(request, { params: Promise.resolve({ id: idea.id }) });
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.idea.status).toBe('rejected');
  });

  it('should return 403 when session role is "submitter"', async () => {
    // Arrange — AC-3: non-admin must be rejected
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ role: 'submitter' }));
    const submitter = await createTestUser(db, { id: 'submitter-1', email: 'sub@epam.com' });
    const idea = insertTestIdea(db, submitter.id);
    const request = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });

    // Act
    const response = await POST(request, { params: Promise.resolve({ id: idea.id }) });

    // Assert — derived from US-004 AC-3
    expect(response.status).toBe(403);
  });

  it('should return 422 when status value is not "accepted" or "rejected"', async () => {
    // Arrange — AC-4
    const submitter = await createTestUser(db, { id: 'submitter-1', email: 'sub@epam.com' });
    const idea = insertTestIdea(db, submitter.id);
    const request = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending' }),
    });

    // Act
    const response = await POST(request, { params: Promise.resolve({ id: idea.id }) });

    // Assert — derived from US-004 AC-4
    expect(response.status).toBe(422);
  });

  it('should return 404 when the idea id does not exist in the database', async () => {
    // Arrange — AC-5
    const request = new NextRequest('http://localhost/api/ideas/nonexistent-id/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });

    // Act
    const response = await POST(request, { params: Promise.resolve({ id: 'nonexistent-id' }) });

    // Assert — derived from US-004 AC-5
    expect(response.status).toBe(404);
  });

  it('should upsert evaluation record and return 200 when idea was already evaluated', async () => {
    // Arrange — AC-6: evaluating a second time replaces the existing evaluation
    const submitter = await createTestUser(db, { id: 'submitter-1', email: 'sub@epam.com' });
    const idea = insertTestIdea(db, submitter.id);

    const firstRequest = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted', notes: 'First decision' }),
    });
    await POST(firstRequest, { params: Promise.resolve({ id: idea.id }) });

    const secondRequest = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', notes: 'Changed mind' }),
    });

    // Act
    const response = await POST(secondRequest, { params: Promise.resolve({ id: idea.id }) });
    const body = await response.json();

    // Assert — derived from US-004 AC-6
    expect(response.status).toBe(200);
    expect(body.idea.status).toBe('rejected');
    expect(body.idea.evaluation_notes).toBe('Changed mind');

    // Verify only one evaluation row exists (upsert, not duplicate insert)
    const evalCount = (
      db.prepare('SELECT count(*) AS cnt FROM evaluations WHERE idea_id = ?').get(idea.id) as {
        cnt: number;
      }
    ).cnt;
    expect(evalCount).toBe(1);
  });

  it('should insert one notification row for the submitter after a successful evaluation', async () => {
    // Arrange — ADR-002 side effect
    const submitter = await createTestUser(db, { id: 'submitter-1', email: 'sub@epam.com' });
    const idea = insertTestIdea(db, submitter.id, { title: 'Notification idea' });
    const request = new NextRequest(`http://localhost/api/ideas/${idea.id}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });

    // Act
    await POST(request, { params: Promise.resolve({ id: idea.id }) });

    // Assert — derived from ADR-002: notification row inserted for the submitter
    const notification = db
      .prepare('SELECT * FROM notifications WHERE user_id = ?')
      .get(submitter.id) as { user_id: string; message: string; is_read: number } | undefined;

    expect(notification).toBeDefined();
    expect(notification?.user_id).toBe(submitter.id);
    expect(notification?.message).toContain('Notification idea');
    expect(notification?.message).toContain('accepted');
    expect(notification?.is_read).toBe(0);
  });
});
