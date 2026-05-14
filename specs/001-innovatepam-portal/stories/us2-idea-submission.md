# User Story: Idea Submission

**Story ID:** US-002  
**Epic:** EP-002 — Idea Lifecycle & Management  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Done

---

## 1. User Story

> As a **logged-in submitter**,  
> I want to **fill in an idea submission form and optionally attach a supporting document**,  
> so that **my idea is recorded in the system and visible to evaluators**.

---

## 2. Acceptance Criteria

- [x] **AC-1:** Given a logged-in submitter on `/submit`, when they provide title, description, and category and click Submit, then the idea is created with status `submitted` and they are redirected to `/dashboard` with a success toast.
- [x] **AC-2:** Given a submitter on `/submit`, when they attach a supported file (≤ 10 MB), then the file is uploaded, stored on disk, and linked to the idea.
- [x] **AC-3:** Given a submitter on `/submit`, when they leave the title or description blank and click Submit, then inline validation errors are shown and the form is not submitted.
- [x] **AC-4:** Given a submitter on `/submit`, when they try to attach a file larger than 10 MB, then they see "File must be under 10 MB" and the upload is rejected.
- [x] **AC-5:** Given a submitter on `/submit`, when they select a category, then only the five defined categories are available: Technical, Process Improvement, Client Solutions, Cost Reduction, Employee Experience.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas` — multipart form data. Returns `201 Created` with idea ID. File served via `GET /api/attachments/[id]` (owner + admin only).
- **Data / Schema:** `ideas` table: `id`, `title` (≤ 100 chars), `description` (≤ 2000 chars), `category`, `status` (DEFAULT `submitted`), `submitter_id` FK, `is_anonymous`, `created_at`, `updated_at`. `attachments` table: `id`, `idea_id`, `filename`, `filepath`, `mimetype`, `size`.
- **Dependencies:** US-001 (auth session required). Local `uploads/` directory must be writable.
- **Edge Cases:** Partial upload failure → idea record is not created; return error and let user retry. Attachment stored outside web root; served only via authenticated API route.
- **Security:** MIME type validated server-side against allowlist (PDF, DOCX, PPTX, XLSX, PNG, JPG/JPEG, GIF, MP4). File path constructed with `crypto.randomUUID()` to prevent name collisions. All inputs validated with Zod before DB write.

---

## 4. Estimation

**Estimate:** 5 story points

**Rationale:** File upload involves multipart parsing, server-side validation, disk I/O, and a separate authenticated serving route — more moving parts than a plain form submission.
