# User Story: Multi-Stage Review Pipeline

**Story ID:** US-009  
**Epic:** EP-005 — Multi-Stage Review Pipeline  
**Author:** Engineering team  
**Date:** 2026-05-14  
**Status:** Done

---

## 1. User Story

> As an **admin**,  
> I want to **move ideas through a structured four-stage pipeline (Submitted → Screening → Under Review → Accepted / Rejected) with a full audit trail**,  
> so that **I can manage large volumes of ideas systematically and maintain accountability for every decision**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given an admin on a `submitted` idea, when they click "Move to Screening", then status becomes `screening` and the transition is logged in `review_stage_history`.
- [x] **AC-2:** Given an admin on a `screening` idea, when they click "Move to Under Review", then status becomes `under_review`.
- [x] **AC-3:** Given an admin on an `under_review` idea, when they click "Accept" or "Reject", then status becomes `accepted` or `rejected` respectively.
- [x] **AC-4:** Given an admin on a terminal-state idea (`accepted` or `rejected`), when they click "Reopen Review", then status returns to `under_review`.
- [x] **AC-5:** Given any stage transition has been made, when the admin views the idea detail page, then a Review History timeline shows each transition with evaluator name, timestamp, and notes.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas/[id]/evaluate` — extended to insert a row into `review_stage_history` on every call, alongside the evaluation upsert and status update.
- **Data / Schema:** `review_stage_history`: `id`, `idea_id` (FK → ideas), `from_status`, `to_status`, `evaluator_id` (FK → users), `notes`, `created_at`. `ideas.status` CHECK extended to include `screening`.
- **Dependencies:** US-005 (evaluation endpoint), EP-003 (admin detail page).
- **Edge Cases:** `TRANSITIONS` map in `EvaluationForm` enforces valid forward transitions client-side; server validates the `decision` field as well. An idea in `screening` that is directly rejected (skipping under_review) is intentionally not supported — must follow the pipeline.
- **Security:** Only admins can trigger stage transitions. All transitions logged immutably — no DELETE on `review_stage_history`.

---

## 4. Estimation

**Estimate:** 5 story points

**Rationale:** Schema migration (`screening` status + new `review_stage_history` table), transition validation logic, atomic write across three operations (update idea, upsert evaluation, insert history), and a timeline UI component.
