# Epic: Enhanced Submission Experience

**Epic ID:** EP-004  
**Related PRD:** specs/001-innovatepam-portal/spec.md  
**Owner:** Engineering team  
**Date:** 2026-05-13  
**Status:** Draft

---

## 1. Description

Enriches the idea submission experience with two quality-of-life features: dynamic category-specific form fields that capture richer, structured metadata per idea type, and multi-file attachment support with inline image previews. Together these raise the quality of information submitted and reduce the back-and-forth between admins and submitters.

> **Note:** This epic is **not yet implemented**. US-006 and US-007 are defined in the spec and ready for a future sprint.

---

## 2. Primary Persona

**Persona:** EPAM Employee (Submitter)  
**Benefit:** Can provide richer, more structured information when submitting an idea — reducing the chance of rejection due to missing context.

---

## 3. Success Criteria

- [ ] Selecting a category renders the correct category-specific fields without a page reload.
- [ ] Switching category clears previous category-specific values.
- [ ] Required category-specific fields block submission if left blank.
- [ ] A submitter can attach up to 5 files of mixed types (PDF, DOCX, images, MP4).
- [ ] Images attached to an idea render as inline thumbnails on the detail page.

---

## 4. Scope / Complexity

**Size:** M — Medium (1–2 weeks)

**Justification:** Smart forms require controlled React state per category definition; multi-file upload extends the existing single-file path with UI changes and a new `attachments` list relationship, plus thumbnail generation.

### In Scope

- Dynamic category fields in `IdeaForm` (Technical, Process Improvement, Client Solutions)
- `category_metadata` JSON stored in `ideas` table
- Multiple file input with count validation (max 5)
- Image thumbnail rendering on detail page
- Non-image attachment display with file icon and download link

### Out of Scope

- Cloud storage for attachments (local disk only)
- Video streaming / playback
- Cost Reduction and Employee Experience category-specific fields (deferred)

---

## 5. Dependencies

| ID  | Dependency                               | Type      | Status  |
|-----|------------------------------------------|-----------|---------|
| D-1 | EP-002 (Idea Lifecycle) — form exists    | Technical | Done    |
| D-2 | EP-001 (Auth) — session required         | Technical | Done    |
| D-3 | `category_metadata` column in `ideas`    | Technical | Pending |

---

## 6. User Stories

| Story  | Title                     | Priority | Status |
|--------|---------------------------|----------|--------|
| US-006 | Smart Submission Forms    | P3       | Draft  |
| US-007 | Multi-Media Attachments   | P3       | Draft  |
