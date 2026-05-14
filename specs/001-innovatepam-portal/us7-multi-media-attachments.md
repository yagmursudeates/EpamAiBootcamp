# User Story: Multi-Media Attachments

**Story ID:** US-007  
**Epic:** EP-004 — Enhanced Submission Experience  
**Author:** Engineering team  
**Date:** 2026-05-13  
**Status:** Draft

---

## 1. User Story

> As a **logged-in submitter**,  
> I want to **attach multiple files of different types to my idea and see inline previews on the detail page**,  
> so that **evaluators have richer supporting material to assess my idea without leaving the portal**.

---

## 2. Acceptance Criteria

- [ ] **AC-1:** Given a submitter on `/submit`, when they attach multiple files, then all files are listed with name and size before submission.
- [ ] **AC-2:** Given a submitter attaching files, when the total count exceeds 5, then they see "Maximum 5 attachments allowed" and further uploads are blocked.
- [ ] **AC-3:** Given an idea with image attachments on the detail page, when viewed by any authenticated user, then images render as inline thumbnails.
- [ ] **AC-4:** Given an idea with non-image attachments, when viewed on the detail page, then each shows a file icon, filename, and download link.
- [ ] **AC-5:** Given a submitter attaching an unsupported MIME type, when they try to upload, then they see "File type not supported" and the file is rejected.

---

## 3. Technical Notes

- **API / Endpoint:** `POST /api/ideas` — extend to accept multiple files (multipart). `GET /api/attachments/[id]` unchanged; multiple attachment IDs returned from idea endpoint.
- **Data / Schema:** `attachments` table supports multiple rows per `idea_id` — already structured for this. Client needs to list all `attachments` on the idea detail response.
- **Dependencies:** US-002 (single-file upload path exists as base), EP-001 (auth).
- **Edge Cases:** If the user removes a file from the list before submitting, it should not be uploaded. Existing single-attachment draft ideas must migrate gracefully (they already use the `attachments` table).
- **Security:** Each file validated individually (MIME + size). Total attachment size capped at 5 × 10 MB. File paths use UUID to prevent collision and path traversal. Attachments served only to owner + admins.

---

## 4. Estimation

**Estimate:** 5 story points

**Rationale:** Multi-file input state management, file list UI with per-file removal, inline image thumbnails, and server-side handling of multiple uploads in a single request — each individually small but together meaningful.
