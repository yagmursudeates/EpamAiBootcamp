# Epic: Blind Review & Privacy Controls

**Epic ID:** EP-006  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-14  
**Status:** Done

---

## 1. Description

Reduces evaluation bias through two complementary privacy mechanisms: a global admin-toggled Blind Review mode that hides all submitter names across the admin portal, and a per-idea anonymous submission option that permanently hides a specific submitter's identity regardless of the global toggle. Submitters are informed when their idea is displayed anonymously.

---

## 2. Primary Persona

**Persona:** Admin (Innovation Manager)  
**Benefit:** Can evaluate ideas on merit alone, free from name-recognition bias, by enabling a single toggle that affects all visible ideas at once.

---

## 3. Success Criteria

- [x] Toggling Blind Review on replaces all submitter names with "Anonymous" instantly in the admin list.
- [x] Toggling Blind Review off restores real names for non-anonymous ideas.
- [x] An idea marked `is_anonymous = 1` always shows "Anonymous" to admins, regardless of the global toggle state.
- [x] Submitters see a "🔒 Submitted anonymously" badge on their own anonymously-submitted ideas.
- [x] The `blind_mode` setting persists across server restarts (stored in `settings` table).

---

## 4. Scope / Complexity

**Size:** S — Small (1–3 days)

**Justification:** Lightweight feature — a settings table key-value lookup, a toggle API endpoint, and conditional name rendering in two existing components.

### In Scope

- `settings` table with `blind_mode` key (values `'0'` / `'1'`)
- `GET /api/admin/blind-mode` and `POST /api/admin/blind-mode` (admin-only)
- `BlindModeToggle` client component with optimistic UI
- `is_anonymous INTEGER` column on `ideas` table
- Anonymous checkbox on `IdeaForm`
- Conditional name display in admin list and detail page
- "🔒 Submitted anonymously" badge on submitter detail page

### Out of Scope

- Per-user blind mode preferences
- Blinding evaluation notes (only names are hidden)
- Admin seeing who submitted an anonymous idea

---

## 5. Dependencies

| ID  | Dependency                                       | Type      | Status |
|-----|--------------------------------------------------|-----------|--------|
| D-1 | EP-003 (Admin Evaluation Core) — admin UI exists | Technical | Done   |
| D-2 | EP-002 (Idea Lifecycle) — IdeaForm exists        | Technical | Done   |
| D-3 | `settings` table migration                       | Technical | Done   |
| D-4 | `is_anonymous` column migration                  | Technical | Done   |

---

## 6. User Stories

| Story  | Title                                 | Priority | Status |
|--------|---------------------------------------|----------|--------|
| US-010 | Blind Review & Anonymous Submission   | P3       | Done   |
