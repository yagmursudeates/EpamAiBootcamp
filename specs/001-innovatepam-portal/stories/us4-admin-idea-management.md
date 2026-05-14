# User Story: Admin Idea Management

**Story ID:** US-004  
**Epic:** EP-003 — Admin Evaluation Core  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. User Story

> As an **admin**,  
> I want to **see all submitted ideas from every user in a filterable list and open the full details of any idea**,  
> so that **I can efficiently triage incoming ideas before starting the evaluation process**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given a logged-in admin on `/admin/ideas`, when they view the page, then they see all non-draft ideas from all submitters showing title, submitter name, category, status, and submission date.
- [x] **AC-2:** Given a logged-in admin on `/admin/ideas`, when they apply a status filter, then only ideas matching that status are shown.
- [x] **AC-3:** Given a logged-in submitter, when they navigate to `/admin`, then they are redirected to `/dashboard`.
- [x] **AC-4:** Given a logged-in admin on `/admin/ideas`, when they click an idea, then they see the full detail page including submitter name and any attached file.

---

## 3. Technical Notes

- **API / Endpoint:** `GET /api/ideas?all=true` — admin-only endpoint returning all non-draft ideas joined with user names. Status filter applied as query param `?status=submitted`.
- **Data / Schema:** Joins `ideas` with `users` on `submitter_id`. `draft` status excluded via `WHERE status != 'draft'`.
- **Dependencies:** US-001 (admin session), US-002 (ideas must exist).
- **Edge Cases:** A direct URL to `/admin/ideas/[id]` for a draft returns 403. Admin account can also submit ideas — admin ideas appear in their own admin list too.
- **Security:** `proxy.ts` enforces `role = admin` check before allowing access to `/admin/*` routes. No submitter data beyond what is necessary is returned.

---

## 4. Estimation

**Estimate:** 2 story points

**Rationale:** Admin list is a simple SELECT with a join and optional WHERE filter — primary work is the role-guard middleware and the detail page route.
