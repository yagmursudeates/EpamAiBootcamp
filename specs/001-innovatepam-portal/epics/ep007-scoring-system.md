# Epic: Quantitative Scoring System

**Epic ID:** EP-007  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-14  
**Status:** Done

---

## 1. Description

Adds a structured 1–5 scoring grid to the admin evaluation workflow, covering four key dimensions: Innovation, Feasibility, Impact, and Clarity. Scores are stored as JSON alongside the evaluation decision, displayed with visual bar indicators and a live average, and made visible to submitters on their own idea detail pages. This transforms evaluation from a binary decision into a richer, data-driven assessment.

---

## 2. Primary Persona

**Persona:** Admin (Innovation Manager)  
**Benefit:** Can communicate the reasoning behind an evaluation decision quantitatively, giving submitters actionable feedback on which dimensions their idea excels or falls short.

---

## 3. Success Criteria

- [x] The evaluation form shows a 1–5 interactive score picker for each of the four dimensions.
- [x] A live average score is calculated and displayed below the pickers before submission.
- [x] Scores are persisted as JSON in `evaluations.scores` and survive re-evaluation (overwrite).
- [x] The admin idea detail page shows a Scores card with bar indicators and average.
- [x] The submitter idea detail page shows the same scores and average when an evaluation has been submitted.

---

## 4. Scope / Complexity

**Size:** S — Small (1–3 days)

**Justification:** Scores layer on top of the existing evaluation upsert — a JSON column addition, a score picker UI component, and two display cards. No new tables or routes required.

### In Scope

- `scores TEXT` column on `evaluations` table (JSON: `{innovation, feasibility, impact, clarity}`)
- `ScoresSchema` Zod validator (1–5 integer per dimension)
- Score picker UI in `EvaluationForm` (4 × 5 buttons, filled style for ≤ current)
- Live average display during scoring
- Scores card with bar indicators on admin and submitter detail pages
- `IdeaScores` TypeScript type in `src/types/db.ts`

### Out of Scope

- Weighted scoring (all four dimensions are equal weight)
- Score history across multiple evaluations (latest overwrites)
- Score-based idea sorting / leaderboard

---

## 5. Dependencies

| ID  | Dependency                                      | Type      | Status |
|-----|-------------------------------------------------|-----------|--------|
| D-1 | EP-003 (Admin Evaluation Core) — form exists    | Technical | Done   |
| D-2 | EP-005 (Multi-Stage Review) — stage pipeline    | Technical | Done   |
| D-3 | `scores` column migration on `evaluations`      | Technical | Done   |

---

## 6. User Stories

| Story  | Title            | Priority | Status |
|--------|------------------|----------|--------|
| US-011 | Scoring System   | P3       | Done   |
