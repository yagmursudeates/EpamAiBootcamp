import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/ideas/route';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { insertTestIdea } from '../../helpers/ideas';
import { mockSession } from '../../helpers/auth';
import type Database from 'better-sqlite3';

// ─── T023: GET /api/ideas (US-003 AC-1, AC-2) ────────────────────────────────

describe('GET /api/ideas', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mock('@/lib/db', () => ({ getDb: () => db }));
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return only ideas whose submitter_id matches the authenticated user', async () => {
    // Arrange — AC-1: "submitter sees own ideas only"
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    const other = await createTestUser(db, { id: 'other-1', email: 'other@epam.com' });
    insertTestIdea(db, owner.id, { title: 'Owner idea' });
    insertTestIdea(db, other.id, { title: 'Other idea' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: owner.id, email: owner.email }));

    // Act
    const response = await GET(new NextRequest('http://localhost/api/ideas'));
    const body = await response.json();

    // Assert — derived from US-003 AC-1
    expect(response.status).toBe(200);
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].title).toBe('Owner idea');
  });

  it('should not return ideas belonging to a different user', async () => {
    // Arrange — AC-1 isolation
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    const other = await createTestUser(db, { id: 'other-1', email: 'other@epam.com' });
    insertTestIdea(db, other.id, { title: 'Private idea by other user' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: owner.id, email: owner.email }));

    // Act
    const response = await GET(new NextRequest('http://localhost/api/ideas'));
    const body = await response.json();

    // Assert — "other user's idea must NOT appear in owner's list"
    expect(body.ideas).toHaveLength(0);
    expect(body.ideas.some((i: { title: string }) => i.title === 'Private idea by other user')).toBe(false);
  });

  it('should return an empty array when the authenticated user has no ideas', async () => {
    // Arrange — AC-2: empty state
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: owner.id, email: owner.email }));

    // Act
    const response = await GET(new NextRequest('http://localhost/api/ideas'));
    const body = await response.json();

    // Assert — derived from US-003 AC-2
    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
  });
});
