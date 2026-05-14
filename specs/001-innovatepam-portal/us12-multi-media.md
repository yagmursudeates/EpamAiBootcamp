# User Story 12 — Multi-Media Support / Multiple File Attachments (Course Phase 3)

**Feature Branch**: `course_project`
**Created**: 2026-05-14
**Status**: Draft
**Priority**: P2
**Depends on**: US2 (idea submission), Phase 1 MVP

---

## Overview

Submitters can attach up to 5 files of any supported type when submitting an idea.
All attached files are listed on the idea detail page and can be downloaded individually
by both the submitter and admin. The single-attachment restriction is removed.

---

## Functional Requirements

| ID     | Requirement                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| FR-M01 | The submission form accepts multiple files via a single file input (`multiple` attribute).             |
| FR-M02 | Up to 5 files can be attached per idea. Attempting a 6th returns a 409 error.                          |
| FR-M03 | Each file must be one of the supported types: PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, MP4.               |
| FR-M04 | Each file must be ≤ 20 MB. Oversized files are rejected individually.                                  |
| FR-M05 | All selected files are uploaded sequentially after the idea is created.                                |
| FR-M06 | If one file upload fails, the others still proceed; the user sees a warning for failed files.          |
| FR-M07 | The idea detail page (submitter + admin) lists all attachments with filename and a download link each. |
| FR-M08 | The existing download endpoint (`GET /api/attachments/[id]/download`) is unchanged.                    |

---

## Acceptance Scenarios

1. **Given** a submitter selects 3 files and submits, **then** all 3 are uploaded and linked to the idea.
2. **Given** a submitter selects 6 files, **when** the 6th upload is attempted, **then** the API returns 409 and the first 5 succeed.
3. **Given** a file exceeds 20 MB, **when** it is uploaded, **then** the API returns 400 and the other files are unaffected.
4. **Given** an idea has multiple attachments, **when** viewed on the detail page, **then** each filename is shown as a separate download link.
5. **Given** a file has a disallowed MIME type, **when** uploaded, **then** the API returns 400 with "File type not allowed".

---

## Out of Scope

- Deleting individual attachments after submission
- Replacing/updating attachments
- Total size cap across all files
- Drag-and-drop upload UI
