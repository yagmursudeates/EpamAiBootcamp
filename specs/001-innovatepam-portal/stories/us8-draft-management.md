# User Story: Draft Management

**Story ID:** US-008  
**Epic:** EP-002 — Idea Lifecycle & Management  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. User Story

> As a **logged-in submitter**,  
> I want to **save an incomplete idea as a draft, return later to edit it, and submit when I'm ready**,  
> so that **I don't lose work-in-progress ideas and can refine them before they reach evaluators**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given a submitter on `/submit`, when they click "Save Draft", then the idea is saved with status `draft` and they see a confirmation toast.
- [x] **AC-2:** Given a submitter with saved drafts, when they visit `/dashboard`, then drafts appear in a separate "My Drafts" section distinct from submitted ideas.
- [x] **AC-3:** Given a submitter on the drafts list, when they click "Edit", then the submission form opens pre-filled with the draft's data (including the anonymous flag).
- [x] **AC-4:** Given a submitter editing a draft, when they click "Submit", then status changes to `submitted` and the idea moves to the main ideas list.
- [x] **AC-5:** Given a logged-in admin on `/admin/ideas`, when they view all ideas, then drafts are not visible.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas` with `status: 'draft'` for save-draft. `PATCH /api/ideas/[id]` for editing and submitting a draft (updates all fields + status). `DELETE /api/ideas/[id]` for discarding a draft.
- **Data / Schema:** `ideas.status` includes `draft` in the CHECK constraint. Draft ideas excluded from all admin queries (`WHERE status != 'draft'`).
- **Dependencies:** US-002 (IdeaForm), US-003 (dashboard listing), EP-001 (auth).
- **Edge Cases:** Once an idea is `submitted` (or beyond), the edit form is read-only for the submitter — only `draft` status allows edits. A direct URL to a draft's detail page by an admin returns 403.
- **Security:** `PATCH /api/ideas/[id]` validates that the requester is the idea's owner before allowing edits. Status cannot be set to arbitrary values — Zod constrains allowed transitions.

---

## 4. Estimation

**Estimate:** 3 story points

**Rationale:** Reuses the existing IdeaForm with a pre-fill mode, a Save Draft button with `type="button"` to skip HTML5 validation, and a PATCH endpoint. Primary complexity is the edit-mode conditional rendering and the submit-from-draft status transition.
