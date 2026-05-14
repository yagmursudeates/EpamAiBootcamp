# User Story: Blind Review & Anonymous Submission

**Story ID:** US-010  
**Epic:** EP-006 — Blind Review & Privacy Controls  
**Author:** Engineering team  
**Date:** 2026-05-14  
**Status:** Done

---

## 1. User Story

> As an **admin**,  
> I want to **toggle a global Blind Review mode that hides all submitter names, and as a submitter I want to opt individual ideas into permanent anonymity**,  
> so that **evaluations are based on idea merit rather than the submitter's identity or seniority**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given an admin on `/admin/ideas`, when they click the Blind Review toggle, then all submitter names across the list are replaced with "Anonymous".
- [x] **AC-2:** Given Blind Review is off but a submitter has marked an idea as anonymous, when an admin views that idea, then it still shows "Anonymous" rather than the real name.
- [x] **AC-3:** Given a submitter on `/submit`, when they check "Submit anonymously", then the idea is stored with `is_anonymous = 1`.
- [x] **AC-4:** Given a submitter viewing their own anonymously-submitted idea, when they open the detail page at `/ideas/[id]`, then a "🔒 Submitted anonymously" badge is shown.
- [x] **AC-5:** Given Blind Review is toggled back off, when an admin views ideas, then non-anonymous ideas show real names again; per-idea anonymous ideas remain hidden.

---

## 3. Technical Notes

- **API / Endpoint:** `GET /api/admin/blind-mode` returns `{blindMode: boolean}`. `POST /api/admin/blind-mode` toggles the value (admin-only). Both protected by session + role check.
- **Data / Schema:** `settings` table: `key TEXT PRIMARY KEY`, `value TEXT NOT NULL DEFAULT ''`. Seed row: `('blind_mode', '0')`. `ideas.is_anonymous INTEGER NOT NULL DEFAULT 0`.
- **Dependencies:** US-002 (idea creation — `is_anonymous` stored on submit), US-004 (admin list renders names), EP-001 (auth).
- **Edge Cases:** `BlindModeToggle` uses optimistic UI — reverts on API error. `isBlindMode()` is called server-side during SSR so the initial render is always correct. Admins cannot discover the real submitter of an anonymous idea through any API endpoint.
- **Security:** `blind_mode` setting writable only by admin role. `is_anonymous` is set at submission time by the submitter and is immutable thereafter (no PATCH path to change it).

---

## 4. Estimation

**Estimate:** 3 story points

**Rationale:** Small surface area — a settings read/write, two column additions, one new client component, and conditional rendering in two existing pages. Tests require care around the UNIQUE constraint on the seed row.
