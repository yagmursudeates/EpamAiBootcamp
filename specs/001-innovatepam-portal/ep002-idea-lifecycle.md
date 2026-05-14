# Epic: Idea Lifecycle & Management

**Epic ID:** EP-002  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. Description

Covers the full journey of an idea from inception to submission tracking: creating an idea with optional file attachment, viewing and filtering owned ideas on a personal dashboard, reading evaluation feedback on detail pages, and saving incomplete ideas as drafts for later submission. This epic delivers the core value proposition for the submitter persona.

---

## 2. Primary Persona

**Persona:** EPAM Employee (Submitter)  
**Benefit:** Can document and track innovative ideas through the entire lifecycle — from first draft to evaluated result — in one place.

---

## 3. Success Criteria

- [x] A submitter can fill in title, description, category, and optional file attachment and submit an idea in under 2 minutes.
- [x] Submitted ideas appear on `/dashboard` with correct status badges.
- [x] Clicking an idea opens a detail page showing all submitted content plus evaluation notes once evaluated.
- [x] A submitter can save a draft, close the browser, and resume editing the draft on a later visit.
- [x] Drafts are invisible to admins and do not appear in the admin idea list.

---

## 4. Scope / Complexity

**Size:** L — Large (2–4 weeks)

**Justification:** Three interconnected stories covering form submission, file upload with server-side validation, authenticated file serving, dashboard listing, and draft persistence across sessions.

### In Scope

- `/submit` form (title, description, category, single file attachment)
- Server-side file validation (MIME type, 10 MB limit)
- Local disk file storage, served via authenticated route `/api/attachments/[id]`
- Submitter `/dashboard` with own-ideas listing and empty state
- Idea detail page at `/ideas/[id]`
- Draft save (`status = draft`) and resume editing flow

### Out of Scope

- Multiple file attachments (EP-004)
- Category-specific dynamic fields (EP-004)
- Admin-visible idea listing (EP-003)

---

## 5. Dependencies

| ID  | Dependency                           | Type      | Status |
|-----|--------------------------------------|-----------|--------|
| D-1 | EP-001 (Auth) — session required     | Technical | Done   |
| D-2 | `ideas` and `attachments` DB tables  | Technical | Done   |
| D-3 | Local `uploads/` directory writable  | Technical | Done   |

---

## 6. User Stories

| Story  | Title                          | Priority | Status |
|--------|--------------------------------|----------|--------|
| US-002 | Idea Submission                | P1       | Done   |
| US-003 | Idea Listing & Status Tracking | P1       | Done   |
| US-008 | Draft Management               | P3       | Done   |
