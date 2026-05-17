import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import * as fs from 'node:fs/promises';
import { POST } from '@/app/api/ideas/route';
import { createTestDb, closeTestDb } from '../../helpers/db';
import { createTestUser } from '../../helpers/users';
import { mockSession } from '../../helpers/auth';
import { SUBMITTED_IDEA } from '../../fixtures/ideas';
import type Database from 'better-sqlite3';

// ─── T020 & T021: POST /api/ideas (US-002 AC-1, AC-2, AC-3, AC-4, AC-5) ──────

describe('POST /api/ideas', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mock('@/lib/db', () => ({ getDb: () => db }));
    vi.mocked(getServerSession).mockResolvedValue(mockSession());
  });

  afterEach(() => {
    closeTestDb(db);
    vi.resetModules();
  });

  // ─── Text-only payload (T020) ──────────────────────────────────────────────

  it('should return 201 and create an idea with status "submitted" for a valid payload', async () => {
    // Arrange — AC-1
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({
        title: SUBMITTED_IDEA.title,
        description: SUBMITTED_IDEA.description,
        category: SUBMITTED_IDEA.category,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert — derived from US-002 AC-1
    expect(response.status).toBe(201);
    expect(body.idea.status).toBe('submitted');
    expect(body.idea.title).toBe(SUBMITTED_IDEA.title);
  });

  it('should return 422 when title is blank', async () => {
    // Arrange — AC-3
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: '', description: 'Valid desc', category: 'Technical' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);

    // Assert — derived from US-002 AC-3: "inline validation errors shown"
    expect(response.status).toBe(422);
  });

  it('should return 422 when description is blank', async () => {
    // Arrange — AC-3
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: 'Valid title', description: '', category: 'Technical' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(422);
  });

  it('should return 422 when category is not one of the five allowed values', async () => {
    // Arrange — AC-5
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: 'Title', description: 'Desc', category: 'InvalidCategory' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(422);
  });

  it('should return 401 when the request is unauthenticated', async () => {
    // Arrange — auth guard
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: JSON.stringify({ title: 'Title', description: 'Desc', category: 'Technical' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(401);
  });
});

// ─── File attachment (T021) ────────────────────────────────────────────────────

describe('POST /api/ideas — file attachment', () => {
  let db: Database.Database;

  beforeEach(async () => {
    db = createTestDb();
    vi.mock('@/lib/db', () => ({ getDb: () => db }));
    vi.mocked(getServerSession).mockResolvedValue(mockSession());
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
  });

  afterEach(() => {
    closeTestDb(db);
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('should store file metadata in the attachments table when a valid file is attached', async () => {
    // Arrange — AC-2
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const formData = new FormData();
    formData.append('title', SUBMITTED_IDEA.title);
    formData.append('description', SUBMITTED_IDEA.description);
    formData.append('category', SUBMITTED_IDEA.category);
    const file = new File(['content'], 'report.pdf', { type: 'application/pdf' });
    formData.append('attachment', file);

    const request = new NextRequest('http://localhost/api/ideas', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const body = await response.json();

    // Assert — derived from US-002 AC-2
    expect(response.status).toBe(201);
    expect(body.idea.attachment).toBeDefined();
    expect(body.idea.attachment.filename).toBe('report.pdf');
  });

  it('should return 422 and not create an idea record when the attached file exceeds 10 MB', async () => {
    // Arrange — AC-4: "file > 10 MB rejected"
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const oversized = new File([new ArrayBuffer(11 * 1024 * 1024)], 'huge.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('title', SUBMITTED_IDEA.title);
    formData.append('description', SUBMITTED_IDEA.description);
    formData.append('category', SUBMITTED_IDEA.category);
    formData.append('attachment', oversized);

    const request = new NextRequest('http://localhost/api/ideas', { method: 'POST', body: formData });

    // Act
    const response = await POST(request);

    // Assert — derived from US-002 AC-4
    expect(response.status).toBe(422);
    // File should NOT have been written to disk
    expect(fs.writeFile).not.toHaveBeenCalled();
    // Idea row should NOT exist in DB
    const row = db.prepare('SELECT id FROM ideas').get();
    expect(row).toBeUndefined();
  });

  it('should return 422 when the attached file MIME type is not in the allowlist', async () => {
    // Arrange — AC-2 security: disallowed MIME type
    await createTestUser(db, { id: 'test-user-submitter-1' });
    const malicious = new File(['content'], 'script.exe', { type: 'application/x-executable' });
    const formData = new FormData();
    formData.append('title', SUBMITTED_IDEA.title);
    formData.append('description', SUBMITTED_IDEA.description);
    formData.append('category', SUBMITTED_IDEA.category);
    formData.append('attachment', malicious);

    const request = new NextRequest('http://localhost/api/ideas', { method: 'POST', body: formData });

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(422);
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
