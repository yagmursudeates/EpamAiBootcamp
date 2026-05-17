import type { Idea } from '../types';
import { SUBMITTER_USER } from './users';

// ─── Fixture: Submitted idea (default state) ─────────────────────────────────
export const SUBMITTED_IDEA: Idea = {
  id: 'test-idea-submitted-1',
  title: 'Automate onboarding checklist',
  description:
    'Replace the manual onboarding PDF with an interactive digital checklist that tracks completion per step.',
  category: 'Process Improvement',
  status: 'submitted',
  submitter_id: SUBMITTER_USER.id,
  is_anonymous: 0,
  created_at: '2026-02-01T10:00:00.000Z',
  updated_at: '2026-02-01T10:00:00.000Z',
};

// ─── Fixture: Accepted idea (with evaluation notes visible) ──────────────────
export const ACCEPTED_IDEA: Idea = {
  id: 'test-idea-accepted-1',
  title: 'Internal knowledge-sharing platform',
  description: 'A lightweight wiki for capturing project lessons learned and best practices.',
  category: 'Employee Experience',
  status: 'accepted',
  submitter_id: SUBMITTER_USER.id,
  is_anonymous: 0,
  created_at: '2026-02-10T08:00:00.000Z',
  updated_at: '2026-02-15T14:30:00.000Z',
};

// ─── Fixture: Rejected idea (with evaluation notes visible) ──────────────────
export const REJECTED_IDEA: Idea = {
  id: 'test-idea-rejected-1',
  title: 'Replace office coffee machines',
  description: 'Upgrade the coffee machines on all floors to a premium espresso model.',
  category: 'Employee Experience',
  status: 'rejected',
  submitter_id: SUBMITTER_USER.id,
  is_anonymous: 0,
  created_at: '2026-02-05T09:00:00.000Z',
  updated_at: '2026-02-12T11:00:00.000Z',
};

// ─── Evaluation notes fixtures (paired with accepted/rejected ideas) ─────────
export const ACCEPTED_EVALUATION_NOTES =
  'Great initiative — aligns with Q3 learning & development goals. Approved for Q2 sprint.';

export const REJECTED_EVALUATION_NOTES =
  'Out of scope for current budget cycle. Please re-submit in H2 with cost analysis.';
