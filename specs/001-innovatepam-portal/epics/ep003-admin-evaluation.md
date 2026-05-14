# Epic: Admin Evaluation Core

**Epic ID:** EP-003  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. Description

Gives administrators complete visibility over all submitted ideas and the ability to evaluate them. Admins can list, filter, and open any idea, then submit an evaluation decision with optional notes — immediately updating the idea's status and making the feedback visible to the submitter.

---

## 2. Primary Persona

**Persona:** Admin (Innovation Manager)  
**Benefit:** Can efficiently triage and evaluate all incoming ideas from a single dashboard, with filtering to focus on the ideas that need attention.

---

## 3. Success Criteria

- [x] An admin sees all non-draft ideas from all submitters in a filterable list on `/admin/ideas`.
- [x] A `submitter` navigating to `/admin` is blocked and redirected.
- [x] An admin can evaluate any idea by selecting a decision and optionally adding notes.
- [x] The idea's status updates immediately on submission and is visible to the submitter.
- [x] Re-evaluation by the same or a different admin overwrites the previous decision.

---

## 4. Scope / Complexity

**Size:** M — Medium (1–2 weeks)

**Justification:** Admin listing with filtering is straightforward; the evaluation form involves a write path that must update two tables (ideas + evaluations) atomically and trigger notification side effects.

### In Scope

- `/admin/ideas` listing with status filter
- Admin idea detail page at `/admin/ideas/[id]`
- Evaluation form with decision dropdown and notes textarea
- `POST /api/ideas/[id]/evaluate` endpoint (upsert evaluation, update idea status)
- Evaluation notes visible to submitter on their detail page

### Out of Scope

- Multi-stage pipeline (EP-005)
- Scoring dimensions (EP-007)
- Blind review / anonymous mode (EP-006)

---

## 5. Dependencies

| ID  | Dependency                              | Type      | Status |
|-----|-----------------------------------------|-----------|--------|
| D-1 | EP-001 (Auth) — admin role required     | Technical | Done   |
| D-2 | EP-002 (Ideas) — ideas must exist       | Technical | Done   |
| D-3 | `evaluations` DB table                  | Technical | Done   |

---

## 6. User Stories

| Story  | Title                    | Priority | Status |
|--------|--------------------------|----------|--------|
| US-004 | Admin Idea Management    | P2       | Done   |
| US-005 | Admin Evaluation Workflow| P2       | Done   |
