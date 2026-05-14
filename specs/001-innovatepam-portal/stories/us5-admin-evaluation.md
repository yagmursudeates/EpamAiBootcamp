# User Story: Admin Evaluation Workflow

**Story ID:** US-005  
**Epic:** EP-003 — Admin Evaluation Core  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. User Story

> As an **admin**,  
> I want to **open any idea, choose an evaluation decision, and optionally add notes**,  
> so that **the idea's status updates immediately and the submitter can read my feedback**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given an admin on an idea detail page, when they view the evaluation panel, then an evaluation form is shown with a decision dropdown (or action buttons) and a notes textarea.
- [x] **AC-2:** Given an admin on the evaluation form, when they select `accepted` and submit, then the idea status changes to `accepted` and their notes are saved.
- [x] **AC-3:** Given an admin on the evaluation form, when they select `rejected` and submit, then the idea status changes to `rejected`.
- [x] **AC-4:** Given an admin on the evaluation form, when they select `under_review` and submit, then the idea status changes to `under_review`.
- [x] **AC-5:** Given an admin on the evaluation form, when they submit without selecting a decision, then they see an inline validation error.
- [x] **AC-6:** Given a submitter viewing their dashboard after evaluation, when the idea has been evaluated, then the updated status and evaluation notes are visible.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas/[id]/evaluate` — upserts the `evaluations` row and updates `ideas.status` in the same transaction. Returns 200 on success.
- **Data / Schema:** `evaluations`: `id`, `idea_id` (UNIQUE), `evaluator_id`, `decision`, `notes`, `scores` (JSON), `created_at`, `updated_at`. One row per idea — re-evaluation overwrites.
- **Dependencies:** US-001 (admin session), US-004 (idea detail page exists).
- **Edge Cases:** Simultaneous evaluation by two admins — last write wins (no locking). Evaluation notes visible to submitter even after a subsequent re-evaluation.
- **Security:** Endpoint validates `role = admin` server-side. All input validated with Zod (`EvaluationSchema`) before DB write.

---

## 4. Estimation

**Estimate:** 3 story points

**Rationale:** Upsert pattern with status sync touches two tables; the admin notification side effect (email + in-app) adds cross-cutting complexity.
