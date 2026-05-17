import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/ideas/[id]/route';
import { getDb } from '@/lib/db';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { insertTestIdea } from '../../helpers/ideas';
import { mockSession } from '../../helpers/auth';
import type Database from 'better-sqlite3';

vi.mock('@/lib/db', () => ({ getDb: vi.fn() }));

// ─── T024: GET /api/ideas/[id] (US-003 AC-3, security) ───────────────────────

describe('GET /api/ideas/[id]', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mocked(getDb).mockReturnValue(db);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  it('should return the full idea detail with evaluations joined for the idea owner', async () => {
    // Arrange — AC-3: "detail page shows title, description, category, status, date, notes"
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    const idea = insertTestIdea(db, owner.id, { title: 'Detail test idea' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: owner.id }));

    // Act
    const response = await GET(
      new NextRequest(`http://localhost/api/ideas/${idea.id}`),
      { params: Promise.resolve({ id: idea.id }) }
    );
    const body = await response.json();

    // Assert — derived from US-003 AC-3
    expect(response.status).toBe(200);
    expect(body.idea.id).toBe(idea.id);
    expect(body.idea.title).toBe('Detail test idea');
    expect(body.idea).toHaveProperty('category');
    expect(body.idea).toHaveProperty('status');
    expect(body.idea).toHaveProperty('created_at');
  });

  it('should return 403 when an authenticated user requests an idea they do not own', async () => {
    // Arrange — US-003 security: "submitter navigating to /ideas/[id] for another's idea → 403"
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    const intruder = await createTestUser(db, { id: 'intruder-1', email: 'intruder@epam.com' });
    const idea = insertTestIdea(db, owner.id);
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: intruder.id }));

    // Act
    const response = await GET(
      new NextRequest(`http://localhost/api/ideas/${idea.id}`),
      { params: Promise.resolve({ id: idea.id }) }
    );

    // Assert
    expect(response.status).toBe(403);
  });

  it('should return 404 for a non-existent idea id', async () => {
    // Arrange — edge case
    const owner = await createTestUser(db, { id: 'owner-1', email: 'owner@epam.com' });
    vi.mocked(getServerSession).mockResolvedValue(mockSession({ id: owner.id }));

    // Act
    const response = await GET(
      new NextRequest('http://localhost/api/ideas/non-existent-id'),
      { params: Promise.resolve({ id: 'non-existent-id' }) }
    );

    // Assert
    expect(response.status).toBe(404);
  });
});
