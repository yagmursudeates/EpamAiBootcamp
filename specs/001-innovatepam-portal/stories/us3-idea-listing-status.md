# User Story: Idea Listing & Status Tracking

**Story ID:** US-003  
**Epic:** EP-002 — Idea Lifecycle & Management  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. User Story

> As a **logged-in submitter**,  
> I want to **see all my submitted ideas and their current statuses on my dashboard, and click through to read full details**,  
> so that **I know what is happening with my ideas and can read feedback from evaluators**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given a logged-in submitter on `/dashboard`, when they view the page, then they see a list of their own ideas (not other users') showing title, category, status badge, and submission date.
- [x] **AC-2:** Given a submitter with no ideas, when they visit `/dashboard`, then they see an empty state with a "Submit your first idea" link.
- [x] **AC-3:** Given a logged-in submitter, when they click on an idea, then the detail page shows title, description, category, status, submission date, attached file (if any), and evaluation notes (if any).
- [x] **AC-4:** Given an idea with status `accepted`, when viewed by its submitter, then the status badge is green and evaluation notes are visible.
- [x] **AC-5:** Given an idea with status `rejected`, when viewed by its submitter, then the status badge is red and evaluation notes are visible.

---

## 3. Technical Notes

- **API / Endpoint:** `GET /api/ideas` — returns ideas for the authenticated submitter only (`WHERE submitter_id = session.user.id`). `GET /api/ideas/[id]` — returns single idea with evaluations joined.
- **Data / Schema:** Joins `ideas` with `evaluations` on `idea_id`. Status badge colour determined by status value in the component.
- **Dependencies:** US-001 (auth), US-002 (ideas must exist to show).
- **Edge Cases:** A submitter navigating to `/ideas/[id]` for an idea they do not own receives 403. Description section hidden if empty (conditional render).
- **Security:** Server-side check ensures submitter can only read their own ideas; admin bypass not exposed on this route.

---

## 4. Estimation

**Estimate:** 2 story points

**Rationale:** Read-only listing and detail pages with straightforward SQL — complexity is in the access control check and empty state UX.
