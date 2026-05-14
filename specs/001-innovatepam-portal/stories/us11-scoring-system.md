# User Story: Scoring System

**Story ID:** US-011  
**Epic:** EP-007 — Quantitative Scoring System  
**Author:** Engineering team  
**Date:** 2026-05-14  
**Status:** Done

---

## 1. User Story

> As an **admin**,  
> I want to **rate each idea on four dimensions (Innovation, Feasibility, Impact, Clarity) using a 1–5 scale as part of my evaluation**,  
> so that **submitters receive quantitative feedback and ideas can be compared objectively**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given an admin on an idea's evaluation form, when they view it, then a 1–5 score picker is shown for each of Innovation, Feasibility, Impact, and Clarity.
- [x] **AC-2:** Given an admin has set scores for all four dimensions, when the average is displayed, then it equals the arithmetic mean of the four scores (e.g., scores of 3, 4, 4, 5 → average 4.0).
- [x] **AC-3:** Given an admin submits an evaluation with scores, when any admin views the idea detail page, then a Scores card with bar indicators and the average is visible.
- [x] **AC-4:** Given a submitter views their evaluated idea, when scores are present, then the four scores and average are shown in the evaluation section of `/ideas/[id]`.
- [x] **AC-5:** Given an admin re-evaluates an idea and changes the scores, when they submit, then the new scores overwrite the previous ones and the updated average is shown.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas/[id]/evaluate` — extended to accept `scores: {innovation, feasibility, impact, clarity}` (all 1–5 integers). Stored as `JSON.stringify(scores)` in `evaluations.scores`.
- **Data / Schema:** `evaluations.scores TEXT` (nullable JSON column). `IdeaScores` type: `{innovation: number, feasibility: number, impact: number, clarity: number}`. `ScoresSchema` Zod validator: each field `z.number().int().min(1).max(5)`.
- **Dependencies:** US-005 (evaluation endpoint), US-009 (stage pipeline — scores submitted alongside stage decisions), EP-003 (admin detail page).
- **Edge Cases:** Scores are optional — evaluation can be submitted without scores (e.g., during Screening stage). Average calculated client-side from the parsed JSON; server does not store the average separately. Re-evaluation with no scores clears existing scores (null overwrites).
- **Security:** Score values validated server-side with Zod before DB write. Integer range 1–5 enforced; fractional or out-of-range values rejected with 400.

---

## 4. Estimation

**Estimate:** 3 story points

**Rationale:** JSON column addition, Zod schema extension, score picker UI (4 × 5 buttons with filled/unfilled state), live average calculation, and two detail page display cards — each step is straightforward but the full set adds up to a meaningful slice of work.
