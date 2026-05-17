# User Story: Admin Idea Evaluation

**Story ID:** US-004  
**Epic:** EP-002 — Idea Lifecycle & Management  
**Author:** Engineering team  
**Date:** 2026-05-17  
**Status:** Ready for development

---

## 1. User Story

> As an **admin**,  
> I want to **evaluate submitted ideas by accepting or rejecting them with optional notes**,  
> so that **submitters receive actionable feedback and the idea lifecycle is completed**.

---

## 2. Acceptance Criteria

- [ ] **AC-1:** Given an admin authenticated with role `admin`, when they send `POST /api/ideas/[id]/evaluate` with `{ status: "accepted" | "rejected", notes?: string }`, then the idea's status is updated and an evaluation record is inserted.
- [ ] **AC-2:** Given a valid evaluation, when the request succeeds, then the response is `200 OK` with the updated idea including `{ id, title, status, evaluation_notes }`.
- [ ] **AC-3:** Given a non-admin user (role `submitter`), when they attempt to evaluate an idea, then the server returns `403 Forbidden`.
- [ ] **AC-4:** Given an `evaluate` request with an invalid status value (not `accepted` or `rejected`), then the server returns `422 Unprocessable Entity`.
- [ ] **AC-5:** Given an idea that does not exist, when an admin attempts to evaluate it, then the server returns `404 Not Found`.
- [ ] **AC-6:** Given an idea that has already been evaluated, when an admin evaluates it again, then the existing evaluation record is replaced (upsert behaviour via `INSERT OR REPLACE`).

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas/[id]/evaluate`
  - Auth guard: session required, role must be `admin`
  - Request body: `{ status: "accepted" | "rejected", notes?: string }`
  - Response: `200 OK` with `{ idea: { id, title, status, evaluation_notes } }`
- **Data / Schema:**
  - Updates `ideas.status` to the provided value
  - Upserts row in `evaluations` table: `id`, `idea_id`, `evaluator_id` (session user id), `notes`, `created_at`
- **Side effect:** After a successful evaluation, inserts a row in the `notifications` table for the idea's `submitter_id` with a human-readable message (e.g. `"Your idea \"<title>\" has been accepted"`). This side-effect is implemented atomically in the same DB transaction.
- **Zod validation:** `evaluationSchema` — `status`: `z.enum(["accepted", "rejected"])`, `notes`: `z.string().optional()`
- **Dependencies:** US-001 (auth session + role), US-002 (ideas table rows exist)

---

## 4. Estimation

**Estimate:** 3 story points

**Rationale:** Single POST route with role check, Zod validation, two-table DB write (ideas + evaluations), and notification side-effect. No file I/O. All covered by integration tests using in-memory SQLite.
