// Shared type definitions for test fixtures and helpers.
// These mirror the database schema defined in src/lib/db/schema.ts.

export type UserRole = 'submitter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

export type IdeaStatus = 'submitted' | 'under_review' | 'accepted' | 'rejected';

export type IdeaCategory =
  | 'Technical'
  | 'Process Improvement'
  | 'Client Solutions'
  | 'Cost Reduction'
  | 'Employee Experience';

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  submitter_id: string;
  is_anonymous: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  idea_id: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

export interface Evaluation {
  id: string;
  idea_id: string;
  evaluator_id: string;
  notes: string | null;
  created_at: string;
}
