# Epic: Multi-Stage Review Pipeline

**Epic ID:** EP-005  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-14  
**Status:** Done

---

## 1. Description

Replaces the binary accept/reject evaluation with a structured 4-stage pipeline: Submitted → Screening → Under Review → Accepted / Rejected. Each stage transition is recorded in an immutable audit log visible to admins as a Review History timeline. Terminal-state ideas can be re-opened into Under Review to correct mistakes.

---

## 2. Primary Persona

**Persona:** Admin (Innovation Manager)  
**Benefit:** Can manage large volumes of ideas systematically, prioritising screening before committing to full review, with a complete audit trail for accountability.

---

## 3. Success Criteria

- [x] An admin can move a submitted idea through all four stages in order.
- [x] The evaluation form only presents valid forward transitions from the current status.
- [x] Every stage transition is logged in `review_stage_history` with evaluator, timestamps, from/to status, and notes.
- [x] The Review History timeline is visible on the idea detail page.
- [x] An accepted or rejected idea can be re-opened to `under_review`.

---

## 4. Scope / Complexity

**Size:** M — Medium (1–2 weeks)

**Justification:** Requires schema changes (`screening` status, `review_stage_history` table), a new migration, transition validation logic in the API, and a timeline UI component.

### In Scope

- `screening` added to `ideas.status` CHECK constraint
- `review_stage_history` table with `from_status`, `to_status`, `evaluator_id`, `notes`, `created_at`
- `TRANSITIONS` map in `EvaluationForm` (only valid next stages rendered as buttons)
- `POST /api/ideas/[id]/evaluate` records history on every transition
- Review History timeline UI on admin idea detail page

### Out of Scope

- Parallel review tracks
- Reviewer assignment (only one admin evaluates per idea)
- Automated stage progression rules

---

## 5. Dependencies

| ID  | Dependency                               | Type      | Status |
|-----|------------------------------------------|-----------|--------|
| D-1 | EP-003 (Admin Evaluation Core)           | Technical | Done   |
| D-2 | `ideas.status` schema extensible         | Technical | Done   |
| D-3 | `review_stage_history` table migration   | Technical | Done   |

---

## 6. User Stories

| Story  | Title                        | Priority | Status |
|--------|------------------------------|----------|--------|
| US-009 | Multi-Stage Review Pipeline  | P3       | Done   |
