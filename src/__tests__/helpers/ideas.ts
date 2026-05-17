import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { Idea, IdeaCategory, IdeaStatus } from '../types';
import { SUBMITTED_IDEA } from '../fixtures/ideas';

export interface InsertTestIdeaOptions {
  id?: string;
  title?: string;
  description?: string;
  category?: IdeaCategory;
  status?: IdeaStatus;
  is_anonymous?: 0 | 1;
}

/**
 * Inserts an idea row into the test database.
 * Uses SUBMITTED_IDEA fixture as base; override any field via options.
 *
 * Constitution §6 — Helpers: insertTestIdea() in src/__tests__/helpers/.
 */
export function insertTestIdea(
  db: Database.Database,
  submitterId: string,
  options: InsertTestIdeaOptions = {}
): Idea {
  const now = new Date().toISOString();

  const idea: Idea = {
    id: options.id ?? uuidv4(),
    title: options.title ?? SUBMITTED_IDEA.title,
    description: options.description ?? SUBMITTED_IDEA.description,
    category: options.category ?? SUBMITTED_IDEA.category,
    status: options.status ?? 'submitted',
    submitter_id: submitterId,
    is_anonymous: options.is_anonymous ?? 0,
    created_at: now,
    updated_at: now,
  };

  db.prepare(`
    INSERT INTO ideas (id, title, description, category, status, submitter_id, is_anonymous, created_at, updated_at)
    VALUES (@id, @title, @description, @category, @status, @submitter_id, @is_anonymous, @created_at, @updated_at)
  `).run(idea);

  return idea;
}
