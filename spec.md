# Feature Specification: InnovatEPAM Portal

**Feature Branch**: `001-innovatepam-portal`

**Created**: 2026-05-13

**Status**: ✅ Completed (all 7 phases)

**Input**: InnovatEPAM Portal is a comprehensive digital platform designed to streamline the innovation process within EPAM, enabling employees to submit creative ideas, facilitating expert evaluation, and managing the implementation of top-tier innovations with dedicated budget allocation.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Employee Registration & Login (Priority: P1)

An EPAM employee visits the portal for the first time and creates an account. On subsequent visits they log in and are taken directly to their personal dashboard.

**Why this priority**: Authentication is the entry gate to every other feature. Nothing else is accessible without it.

**Independent Test**: A tester can register with a new email, log out, log back in, and confirm they land on the correct role-based destination — all without any other feature present.

**Acceptance Scenarios**:

1. **Given** a visitor on `/register`, **When** they submit a valid name, email, and password (≥ 8 chars), **Then** an account is created with role `submitter` and they are redirected to `/dashboard`.
2. **Given** a visitor on `/register`, **When** they submit an email that already exists, **Then** they see an inline error "Email already in use" and the form is not submitted.
3. **Given** a registered `submitter` on `/login`, **When** they submit correct credentials, **Then** they are redirected to `/dashboard`. **Given** a registered `admin` on `/login`, **When** they submit correct credentials, **Then** they are redirected to `/admin`.
4. **Given** a registered user on `/login`, **When** they submit incorrect credentials, **Then** they see "Invalid email or password" and no session is created.
5. **Given** a logged-in user, **When** they click "Logout", **Then** the session is destroyed and they are redirected to `/login`.
6. **Given** an unauthenticated user, **When** they navigate to `/dashboard`, **Then** they are redirected to `/login`.

---

### User Story 2 — Idea Submission (Priority: P1)

A logged-in submitter fills in the idea submission form and optionally attaches a supporting document. The idea is saved with status `submitted` and they receive confirmation.

**Why this priority**: Core value proposition of the portal — without submission there is nothing to evaluate.

**Independent Test**: A submitter can open `/submit`, fill in all required fields, optionally attach a file, submit, and see the idea appear on their dashboard with status `submitted`.

**Acceptance Scenarios**:

1. **Given** a logged-in submitter on `/submit`, **When** they provide title, description, and category and click Submit, **Then** the idea is created with status `submitted` and they are redirected to `/dashboard` with a success toast.
2. **Given** a submitter on `/submit`, **When** they attach a supported file (≤ 10 MB), **Then** the file is uploaded, stored, and linked to the idea.
3. **Given** a submitter on `/submit`, **When** they leave the title or description blank and click Submit, **Then** inline validation errors are shown and the form is not submitted.
4. **Given** a submitter on `/submit`, **When** they try to attach a file larger than 10 MB, **Then** they see "File must be under 10 MB" and the upload is rejected.
5. **Given** a submitter on `/submit`, **When** they select a category, **Then** only the five defined categories are available: Technical, Process Improvement, Client Solutions, Cost Reduction, Employee Experience.

---

### User Story 3 — Idea Listing & Status Tracking (Priority: P1)

A submitter views their personal dashboard to see all ideas they have submitted, along with each idea's current status, and can click through to read full details.

**Why this priority**: Closes the feedback loop — submitters need to see what happened to their ideas.

**Independent Test**: After submitting at least one idea, a submitter visits `/dashboard`, sees it listed with a status badge, clicks it, and the detail page shows all submitted content.

**Acceptance Scenarios**:

1. **Given** a logged-in submitter, **When** they visit `/dashboard`, **Then** they see a list of their own ideas showing title, category, status badge, and submission date.
2. **Given** a submitter with no ideas, **When** they visit `/dashboard`, **Then** they see an empty state with a "Submit your first idea" link.
3. **Given** a logged-in submitter, **When** they click on an idea, **Then** the detail page shows title, description, category, status, submission date, attached file (if any), and evaluation notes (if any).
4. **Given** an idea with status `accepted`, **When** viewed by its submitter, **Then** the status badge is green and evaluation notes are visible.
5. **Given** an idea with status `rejected`, **When** viewed by its submitter, **Then** the status badge is red and evaluation notes are visible.

---

### User Story 4 — Admin Idea Management (Priority: P2)

An admin logs in and sees all submitted ideas across all users. They can filter by status and open any idea's full details.

**Why this priority**: Admins need visibility before they can evaluate. Depends on P1 auth and submission stories.

**Independent Test**: An admin account can log in, visit `/admin`, see ideas from other users, filter by status, and open a detail view — before the evaluation form is implemented.

**Acceptance Scenarios**:

1. **Given** a logged-in admin on `/admin`, **When** they view the page, **Then** they see all ideas from all submitters with title, submitter name, category, status, and date.
2. **Given** a logged-in admin on `/admin`, **When** they apply a status filter, **Then** only ideas matching that status are shown.
3. **Given** a logged-in submitter, **When** they navigate to `/admin`, **Then** they are redirected to `/dashboard`.
4. **Given** a logged-in admin on `/admin`, **When** they click an idea, **Then** they see the full detail including submitter name and attached file.

---

### User Story 5 — Admin Evaluation Workflow (Priority: P2)

An admin opens an idea and submits an evaluation: they choose a decision (accepted / rejected / under review) and optionally add notes. The idea status updates immediately.

**Why this priority**: Completes the core innovation loop. Depends on admin listing (Story 4).

**Independent Test**: An admin can open any `submitted` idea, submit an evaluation, and see the idea's status change and evaluation notes appear — all within a single browser session.

**Acceptance Scenarios**:

1. **Given** an admin on an idea detail page, **When** they click "Evaluate", **Then** an evaluation form appears with a decision dropdown and notes textarea.
2. **Given** an admin on the evaluation form, **When** they select `accepted` and submit, **Then** the idea status changes to `accepted` and their notes are saved.
3. **Given** an admin on the evaluation form, **When** they select `rejected` and submit, **Then** the idea status changes to `rejected`.
4. **Given** an admin on the evaluation form, **When** they select `under_review` and submit, **Then** the idea status changes to `under_review`.
5. **Given** an admin on the evaluation form, **When** they submit without selecting a decision, **Then** they see an inline validation error.
6. **Given** a submitter viewing their dashboard after evaluation, **When** the idea has been evaluated, **Then** the updated status and evaluation notes are visible.

---

### User Story 6 — Smart Submission Forms (Priority: P3)

The submission form dynamically reveals additional fields based on the selected idea category, capturing richer, category-specific information.

**Why this priority**: Enhancement over baseline submission. Requires Story 2 complete first.

**Independent Test**: A submitter selects "Technical" and sees technical-specific fields appear; switching to "Process Improvement" replaces them — without a page reload.

**Acceptance Scenarios**:

1. **Given** a submitter on `/submit`, **When** they select "Technical", **Then** additional fields for "Technology Stack" and "Implementation Complexity" appear.
2. **Given** a submitter on `/submit`, **When** they select "Process Improvement", **Then** additional fields for "Affected Department" and "Estimated Time Saving" appear.
3. **Given** a submitter on `/submit`, **When** they select "Client Solutions", **Then** additional fields for "Target Client Segment" and "Revenue Impact" appear.
4. **Given** a submitter on `/submit`, **When** they change the category, **Then** previously entered category-specific values are cleared.
5. **Given** a submitter submitting with category-specific fields visible, **When** they leave a required field blank, **Then** inline validation prevents submission.

---

### User Story 7 — Multi-Media Attachments (Priority: P3)

Submitters can attach multiple files (documents, images, videos, presentations) to an idea, with inline previews on the detail page.

**Why this priority**: Enriches submissions. Depends on Story 2 (single-file upload).

**Independent Test**: A submitter attaches 3 different file types to an idea. On the detail page, images render as thumbnails; other files show a download icon with filename.

**Acceptance Scenarios**:

1. **Given** a submitter on `/submit`, **When** they attach multiple files, **Then** all files are listed with name and size before submission.
2. **Given** a submitter attaching files, **When** the total count exceeds 5, **Then** they see "Maximum 5 attachments allowed".
3. **Given** an idea with image attachments on the detail page, **When** viewed by any authenticated user, **Then** images render as inline thumbnails.
4. **Given** an idea with non-image attachments, **When** viewed on the detail page, **Then** each shows a file icon, filename, and download link.
5. **Given** a submitter attaching an unsupported MIME type, **When** they try to upload, **Then** they see "File type not supported".

---

### User Story 8 — Draft Management (Priority: P3)

A submitter can save an incomplete idea as a draft, return later to edit it, and submit when ready.

**Why this priority**: Quality-of-life feature. Depends on Story 2.

**Independent Test**: A submitter saves a draft, closes the browser, reopens the portal, finds the draft in "My Drafts", edits it, and submits — the submitted idea appears on the main dashboard with status `submitted`.

**Acceptance Scenarios**:

1. **Given** a submitter on `/submit`, **When** they click "Save Draft", **Then** the idea is saved with status `draft` and they see a confirmation.
2. **Given** a submitter with saved drafts, **When** they visit `/dashboard`, **Then** drafts appear in a separate "My Drafts" section.
3. **Given** a submitter on the drafts list, **When** they click "Edit", **Then** the submission form opens pre-filled with the draft's data.
4. **Given** a submitter editing a draft, **When** they click "Submit", **Then** status changes to `submitted` and it moves to the main ideas list.
5. **Given** an admin on `/admin`, **When** viewing all ideas, **Then** drafts are not visible.

---

### User Story 9 — Multi-Stage Review Pipeline (Priority: P3)

An admin moves ideas through a structured 4-stage evaluation pipeline: Submitted → Screening → Under Review → Accepted / Rejected. The full history of stage transitions is recorded and visible.

**Why this priority**: Provides structured workflow beyond a simple accept/reject binary.

**Independent Test**: Admin opens a submitted idea, moves it to Screening, then Under Review, then Accepts it. The Review History timeline shows all three transitions.

**Acceptance Scenarios**:

1. **Given** an admin on a `submitted` idea, **When** they click "Move to Screening", **Then** status becomes `screening` and the transition is logged in review history.
2. **Given** an admin on a `screening` idea, **When** they click "Move to Under Review", **Then** status becomes `under_review`.
3. **Given** an admin on an `under_review` idea, **When** they click "Accept" or "Reject", **Then** status becomes `accepted` or `rejected`.
4. **Given** an admin on a terminal-state idea (`accepted`/`rejected`), **When** they click "Reopen Review", **Then** status returns to `under_review`.
5. **Given** any stage transition has been made, **When** the admin views the idea detail, **Then** a Review History timeline shows each transition with evaluator name, timestamp, and notes.

---

### User Story 10 — Blind Review & Anonymous Submission (Priority: P3)

Admins can enable a global Blind Review mode that hides all submitter names. Submitters can also opt-in to per-idea anonymity when creating an idea.

**Why this priority**: Reduces bias in evaluation.

**Independent Test**: Admin toggles Blind Review on — all idea cards show "Anonymous". Toggle it off — names reappear. Submitter creates an idea with "Submit anonymously" checked — that idea always shows as anonymous to admins, regardless of blind mode toggle.

**Acceptance Scenarios**:

1. **Given** an admin on `/admin/ideas`, **When** they click the Blind Review toggle, **Then** all submitter names are replaced with "Anonymous" across the list.
2. **Given** Blind Review is off, **When** a submitter has marked an idea as anonymous, **Then** that idea still shows "Anonymous" to admins.
3. **Given** a submitter on `/submit`, **When** they check "Submit anonymously", **Then** the idea is stored with `is_anonymous = 1`.
4. **Given** a submitter viewing their own anonymously-submitted idea, **When** they open the detail page, **Then** a "🔒 Submitted anonymously" badge is shown.
5. **Given** Blind Review is toggled back off, **When** an admin views ideas, **Then** non-anonymous ideas show real names; anonymous ones remain hidden.

---

### User Story 11 — Scoring System (Priority: P3)

Admins rate each idea on four dimensions (Innovation, Feasibility, Impact, Clarity) using a 1–5 scale as part of the evaluation workflow. Scores are saved with the evaluation and visible to both admins and submitters.

**Why this priority**: Provides quantitative evaluation beyond a binary decision.

**Independent Test**: Admin opens an idea, sets scores on all four dimensions, submits an evaluation. The detail page shows a Scores card with bar indicators and the average score. The submitter sees the scores on their own idea detail page.

**Acceptance Scenarios**:

1. **Given** an admin on an idea's evaluation form, **When** they view it, **Then** a 1–5 score picker is shown for each of Innovation, Feasibility, Impact, and Clarity.
2. **Given** an admin has set scores, **When** the average is displayed, **Then** it equals the arithmetic mean of all four scores.
3. **Given** an admin submits an evaluation with scores, **When** any admin views the idea, **Then** a Scores card with bar indicators and average is visible.
4. **Given** a submitter views their evaluated idea, **When** scores are present, **Then** the four scores and average are shown in the evaluation section.
5. **Given** an admin re-evaluates an idea, **When** they change scores and submit, **Then** the new scores overwrite the previous ones.

---

### Edge Cases

- What happens when a file upload partially fails (network drop mid-upload)? → The idea record is not created; return an error and let the user retry.
- What happens when two admins evaluate the same idea simultaneously? → Last write wins; the evaluation is stored with a timestamp.
- What happens when a user's session expires while filling in the submission form? → On submit they are redirected to `/login`; form data is lost.
- What happens when the SQLite DB file is missing on server start? → Server fails fast with a clear error message, not a cryptic 500.
- What happens when a submitter tries to access another submitter's idea directly via URL? → Return 403 Forbidden.
- What happens when an admin requests the detail page of a draft idea? → Return 403 Forbidden (drafts are invisible to admins even via direct URL).

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support two roles: `submitter` and `admin`.
- **FR-002**: System MUST allow any visitor to register with name, email, and password; new accounts receive role `submitter` by default.
- **FR-003**: System MUST reject registration with a duplicate email.
- **FR-004**: System MUST authenticate users via email + bcrypt-verified password.
- **FR-005**: System MUST maintain sessions across page refreshes using JWT (24-hour expiry).
- **FR-006**: System MUST redirect unauthenticated users attempting to access protected routes to `/login`.
- **FR-007**: System MUST prevent `submitter` users from accessing any `/admin` route.
- **FR-008**: System MUST allow logged-in submitters to create ideas with: title (required, ≤ 100 chars), description (required, ≤ 2000 chars), category (required, from fixed list), optional single file attachment (Phase 1).
- **FR-009**: System MUST store ideas with one of four statuses: `submitted`, `under_review`, `accepted`, `rejected`. Phase 4 adds `draft`.
- **FR-010**: System MUST allow submitters to view only their own ideas on their dashboard.
- **FR-011**: System MUST allow admins to view all ideas from all submitters (excluding drafts).
- **FR-012**: System MUST allow admins to evaluate any idea by selecting a decision and optionally adding notes.
- **FR-013**: System MUST update the idea status immediately upon evaluation submission.
- **FR-014**: System MUST display evaluation notes to the submitter on the idea detail page.
- **FR-015**: System MUST validate all API input with Zod before any database operation.
- **FR-016**: File uploads MUST be validated for MIME type (PDF, DOCX, PPTX, XLSX, PNG, JPG/JPEG, GIF, MP4) and size (max 10 MB) server-side.
- **FR-017**: System MUST store uploaded files outside the web root and serve them via authenticated routes only (owner + admins).
- **FR-018** _(Phase 2)_: Submission form MUST display additional required fields dynamically based on the selected category.
- **FR-019** _(Phase 3)_: System MUST support up to 5 file attachments per idea, with inline preview for images.
- **FR-020** _(Phase 4)_: System MUST allow submitters to save ideas as drafts and submit them later.

- **FR-021** _(Phase 5)_: `ideas.status` MUST include `screening` as a valid stage.
- **FR-022** _(Phase 5)_: System MUST record every stage transition in a `review_stage_history` table with evaluator, timestamps, from/to status, and optional notes.
- **FR-023** _(Phase 5)_: Admin evaluation form MUST present only the valid forward transitions from the current status (no arbitrary jumps except terminal re-open).
- **FR-024** _(Phase 6)_: System MUST support a global `blind_mode` setting stored in a `settings` table; when enabled, submitter names are hidden from all admin views.
- **FR-025** _(Phase 6)_: Submitters MUST be able to mark individual ideas as anonymous (`is_anonymous = 1`); anonymous ideas hide the submitter name from admins regardless of global blind mode.
- **FR-026** _(Phase 6)_: Submitters MUST see a "🔒 Submitted anonymously" indicator on their own anonymously-submitted ideas.
- **FR-027** _(Phase 7)_: Admin evaluation MUST include 1–5 integer scores on four dimensions: Innovation, Feasibility, Impact, Clarity.
- **FR-028** _(Phase 7)_: System MUST calculate and display the arithmetic average of the four scores.
- **FR-029** _(Phase 7)_: Scores MUST be stored as a JSON object in the `evaluations.scores` column and displayed with bar indicators on the detail page.
- **FR-030** _(Phase 7)_: Submitters MUST be able to see the scores assigned to their evaluated ideas.

### Key Entities

- **User**: Authenticated person. Key attributes: `id`, `name`, `email`, `password_hash`, `role` (`submitter` | `admin`), `created_at`.
- **Idea**: Central artifact. Key attributes: `id`, `title`, `description`, `category`, `status` (`submitted` | `screening` | `under_review` | `accepted` | `rejected` | `draft`), `submitter_id` (FK → User), `category_metadata` (JSON), `is_anonymous` (INTEGER 0/1), `created_at`, `updated_at`.
- **Attachment**: File linked to an idea. Key attributes: `id`, `idea_id` (FK → Idea), `filename`, `filepath`, `mimetype`, `size`, `created_at`.
- **Evaluation**: Admin decision on an idea. Key attributes: `id`, `idea_id` (FK → Idea, UNIQUE), `evaluator_id` (FK → User), `decision` (`screening` | `under_review` | `accepted` | `rejected`), `notes`, `scores` (JSON: `{innovation, feasibility, impact, clarity}`), `created_at`, `updated_at`.
- **ReviewStageHistory**: Audit log of stage transitions. Key attributes: `id`, `idea_id` (FK → Idea), `from_status`, `to_status`, `evaluator_id` (FK → User), `notes`, `created_at`.
- **Settings**: Key-value store for global config. Key attributes: `key` (TEXT PRIMARY KEY), `value`. Current entries: `blind_mode` (`'0'` | `'1'`).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can register, log in, submit an idea with an attachment, and log out in under 3 minutes.
- **SC-002**: An admin can log in, review all submitted ideas, evaluate one, and see the status reflected in under 2 minutes.
- **SC-003**: All Phase 1 acceptance scenarios pass manual walkthrough with zero blocking defects.
- **SC-004**: Application builds (`npm run build`) and starts (`npm run dev`) without errors on a clean checkout.
- **SC-005**: No secrets or credentials appear in the git history.
- **SC-006**: All API routes return structured error responses — stack traces are never exposed to the client.
- **SC-007** _(Phase 2)_: Category-specific fields render and validate without a page reload.
- **SC-008** _(Phase 3)_: Multiple file uploads complete successfully and previews render on the detail page.
- **SC-009** _(Phase 4)_: A draft can be saved, retrieved, edited, and submitted across separate browser sessions.

- **SC-010** _(Phase 5)_: An admin can move an idea through all four stages and the Review History timeline shows each transition.
- **SC-011** _(Phase 6)_: Blind Review toggle hides all names instantly; per-idea anonymous flag persists independently of the toggle.
- **SC-012** _(Phase 7)_: Scores are saved with each evaluation and the average is correctly computed and displayed to both admin and submitter.

---

## Assumptions

- All users are EPAM employees; there is no public/anonymous access — every route requires authentication.
- Admin accounts are created via the seed script; there is no self-service admin registration.
- File storage is local disk (cloud storage is out of scope for all phases).
- The fixed category list is: **Technical**, **Process Improvement**, **Client Solutions**, **Cost Reduction**, **Employee Experience**.
- Mobile support is required (responsive layout); native mobile apps are out of scope.
- Email notifications are implemented via `nodemailer` (fire-and-forget); sending is gated by `EMAIL_HOST` env var so the app functions without email config.
- Pagination is optional.
- The application runs as a single-instance Node.js process.

---

## Clarification Decisions _(resolved)_

| #      | Ambiguity                          | Decision                                                                                                |
| ------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| CL-001 | Admin post-login destination       | Admin → `/admin`; submitter → `/dashboard`. Role-aware redirect in `middleware.ts`.                     |
| CL-002 | Re-evaluation                      | Admins CAN re-evaluate at any time, overriding the previous decision. No final states.                  |
| CL-003 | Post-submit redirect               | Redirect to `/dashboard` with a success toast.                                                          |
| CL-004 | Submitter editing a submitted idea | Once `submitted` (or beyond), the idea is read-only for the submitter. Only `draft` ideas are editable. |
| CL-005 | Allowed file types                 | PDF, DOCX, PPTX, XLSX, PNG, JPG/JPEG, GIF, MP4. All others rejected with "File type not supported".     |
| CL-006 | Password policy                    | Minimum 8 characters enforced client-side (Zod) and server-side.                                        |
| CL-007 | Attachment access control          | Owner and any admin only. Other submitters receive 403.                                                 |
| CL-008 | Phase 2 category-specific fields   | Required when visible. Submission blocked until filled.                                                 |
| CL-009 | Admin redirect after login         | Admins → `/admin`; submitters → `/dashboard` (Story 1 scenario 3 corrected).                            |
| CL-010 | Draft visibility for admins        | Drafts invisible to admins — direct URL to a draft detail page returns 403.                             |
| CL-011 | Multiple evaluations               | Latest evaluation overwrites previous. One row per idea in `evaluations` (upsert).                      |
| CL-012 | Session / JWT expiry               | 24 hours. Users redirected to `/login` on expiry.                                                       |
| CL-013 | Admin idea submission              | Admins CAN also submit ideas. Role guard only blocks `submitter` from `/admin`.                         |
