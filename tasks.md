# Tasks: InnovatEPAM Portal

**Input**: [plan.md](plan.md) + [spec.md](spec.md)
**Branch**: `01-core-portal` | **Date**: 2026-05-13
**Status Legend**: `[ ]` not started · `[x]` done · `[~]` in progress

---

## Pre-Flight — Git & Repository Setup

**Purpose**: Must be done at Hour 0 of the sprint before any coding. Instructor needs the repo link at kickoff.

- [ ] T000a Create a **public** GitHub (or EPAM GitLab) repository named `innovatepam-portal`
- [ ] T000b `git init` in project root, add remote, push initial commit: `git commit --allow-empty -m "chore: initial commit"` then `git push -u origin main`
- [ ] T000c **Share the repo URL with the instructor** — this is required at Hour 0
- [ ] T000d Create `README.md` in the repo root with: project name, one-line description, tech stack, and `npm install && npm run dev` setup instructions (can be brief now, polish later)
- [ ] T000e Commit: `git add README.md && git commit -m "docs: add README with setup instructions"`

> ⏰ **Sprint discipline**: push a commit roughly every hour. Use `git push` after each phase checkpoint.

---

## Phase 0 — Project Scaffold (Shared Infrastructure)

**Purpose**: Bootstrap the Next.js app, install all dependencies, configure tooling. Must be complete before any feature work.

- [ ] T001 Run `npx create-next-app@latest innovatepam --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` and verify `npm run dev` starts
- [ ] T002 Run `npx shadcn@latest init` — select **New York** style, **CSS variables** on; verify `components.json` is created
- [ ] T003 [P] Install runtime deps: `npm install better-sqlite3 bcryptjs next-auth zod date-fns uuid sonner`
- [ ] T004 [P] Install dev deps: `npm install -D @types/better-sqlite3 @types/bcryptjs prettier prettier-plugin-tailwindcss`
- [ ] T004b [P] Create `.prettierrc` at project root: `{ "plugins": ["prettier-plugin-tailwindcss"], "semi": false, "singleQuote": true }` — aligns with CONSTITUTION Principle I (ESLint + Prettier)
- [ ] T005 Configure `@theme` tokens in `src/app/globals.css` — brand colours + 5 status colour tokens (`--color-status-submitted`, `--color-status-under-review`, `--color-status-accepted`, `--color-status-rejected`, `--color-status-draft`) + `--color-brand-primary: #0057B8`
- [ ] T006 [P] Add `uploads/` dir to `.gitignore`; create empty `uploads/.gitkeep`
- [ ] T006b [P] Add `.github/` to `.gitignore` to prevent accidental credential leakage (per CONSTITUTION security requirements)
- [ ] T007 [P] Add `innovatepam.db` and `.env.local` to `.gitignore`
- [ ] T008 Create `.env.local` with `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`) and `NEXTAUTH_URL=http://localhost:3000`
- [ ] T009 [P] Create `src/lib/utils.ts` — export `cn()` (clsx + tailwind-merge) and `formatDate(iso: string)` / `formatDateTime(iso: string)` using `date-fns/format`
- [ ] T010 [P] Create `src/lib/validations.ts` — export Zod schemas: `RegisterSchema`, `LoginSchema`, `IdeaSchema`, `EvaluationSchema`

**Checkpoint ✅**: `npm run dev` starts without errors; shadcn Button renders on homepage.
Commit: `chore: scaffold Next.js app with shadcn, Tailwind @theme, and dependencies`

---

## Phase 1 — Database Foundation

**Purpose**: Schema, connection singleton, and seed data. All feature phases depend on this.

- [ ] T011 Create `src/lib/db/schema.sql` — `users`, `ideas`, `attachments`, `evaluations` tables with CHECK constraints (see plan.md for exact SQL)
- [ ] T012 Create `src/lib/db/index.ts` — `better-sqlite3` singleton; run `schema.sql` on first connection; export typed `db` instance
- [ ] T013 Create `src/lib/db/seed.ts` — insert 1 admin (`admin@epam.com` / `Admin1234!`) + 2 submitters (`alice@epam.com`, `bob@epam.com`, password `Test1234!`) using bcryptjs; idempotent (skip if email exists)
- [ ] T014 Run seed script: `npx tsx src/lib/db/seed.ts` and verify `innovatepam.db` is created with 3 user rows

**Checkpoint ✅**: Seed runs without errors; 3 rows in `users` table.
Commit: `feat(db): add SQLite schema and seed data`

---

## Phase 2 — Authentication (US1 — Priority: P1) 🎯 MVP

**Goal**: Register, login, logout with role-aware redirect. Unauthenticated users bounced to `/login`.

**Manual Test**: Register with a new email → land on `/dashboard`. Logout → redirected to `/login`. Try `/admin` as submitter → redirected to `/dashboard`.

- [ ] T015 Create `src/lib/auth.ts` — NextAuth v5 config: Credentials provider, bcryptjs verify, JWT strategy, 24h expiry, session callback adds `role` + `id` to token
- [ ] T016 Create `src/app/api/auth/[...nextauth]/route.ts` — export `{ GET, POST }` from auth config
- [ ] T017 Create `src/middleware.ts` — protect routes:
  - `/admin(.*)` → require `role === 'admin'`; redirect others to `/dashboard`
  - `/dashboard(.*)`, `/submit(.*)`, `/ideas(.*)` → require any authenticated session; redirect to `/login`
  - `/login`, `/register` → redirect authenticated users to role destination
- [ ] T018 Create `src/app/api/users/route.ts` — `POST` handler: validate with `RegisterSchema` (Zod), check duplicate email, hash password with bcryptjs, insert user, return `201`; return structured error `400` on duplicate
- [ ] T019 [P] Create `src/app/(auth)/register/page.tsx` — shadcn `<Form>` + `<Input>` (name, email, password ≥8 chars); client-side Zod validation; calls `POST /api/users`; shows inline field errors; redirects to `/login` on success with toast
- [ ] T020 [P] Create `src/app/(auth)/login/page.tsx` — shadcn `<Form>` + `<Input>` (email, password); calls `signIn('credentials')`; shows "Invalid email or password" on failure; role-aware redirect on success (admin→`/admin`, submitter→`/dashboard`)
- [ ] T021 Add `src/app/layout.tsx` root layout — include `<Toaster />` (sonner) and global session provider
- [ ] T022 Add logout button to a shared `<Navbar>` component (`src/components/Navbar.tsx`) using `signOut()` — visible on all authenticated pages

**Checkpoint ✅**: All 6 acceptance scenarios in User Story 1 pass manual walkthrough.
Commit: `feat(auth): registration, login, logout with role-based routing`

---

## Phase 3 — Idea Submission (US2 — Priority: P1) 🎯 MVP

**Goal**: Logged-in submitter fills in and submits an idea with an optional file attachment.

**Manual Test**: Log in as submitter → `/submit` → fill all fields + attach a PDF → submit → toast appears → `/dashboard` shows new idea with status badge `submitted`.

- [ ] T023 Create `src/app/api/ideas/route.ts` — `POST` handler: verify session, validate body with `IdeaSchema` (Zod: title ≤100, description ≤2000, category from enum), insert into `ideas`, return `201 { id }`; `GET` handler: return submitter's own ideas (admin gets all, excluding drafts for admin)
- [ ] T024 Create `src/app/api/ideas/[id]/attachments/route.ts` — `POST`: parse `Request.formData()`, validate MIME type against allowlist (CL-005: PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, MP4), validate size ≤10 MB, write to `uploads/<idea-id>/`, insert `attachments` row, return `201`; `GET`: verify ownership/admin (CL-007), stream file from disk
- [ ] T025 Create `src/components/IdeaForm.tsx` — `"use client"` — shadcn `<Form>` with fields: Title (`<Input>`), Description (`<Textarea>`), Category (`<Select>` with 5 fixed options), Attachment (`<Input type="file">`); react-hook-form + Zod resolver; submit calls `POST /api/ideas` then `POST /api/ideas/[id]/attachments` if file attached
- [ ] T026 Create `src/app/(submitter)/submit/page.tsx` — render `<IdeaForm>`; on success redirect to `/dashboard` with `sonner` toast "Idea submitted successfully"
- [ ] T027 Create `src/app/(submitter)/layout.tsx` — server component; reads session; redirects to `/login` if no session (belt-and-suspenders alongside middleware)

**Checkpoint ✅**: All 5 acceptance scenarios in User Story 2 pass manual walkthrough.
Commit: `feat(submit): idea submission form with single file attachment`

---

## Phase 4 — Idea Listing & Status Tracking (US3 — Priority: P1) 🎯 MVP

**Goal**: Submitter dashboard lists own ideas with status badges; clicking opens detail view.

**Manual Test**: Log in as submitter → `/dashboard` → see submitted idea card with correct status colour → click → detail page shows all fields + attachment download link.

- [ ] T028 Create `src/components/StatusBadge.tsx` — shadcn `<Badge>`; maps status → `--color-status-*` CSS token; displays human-readable label
- [ ] T029 Create `src/components/IdeaCard.tsx` — shows title, category, `<StatusBadge>`, formatted date (`formatDate()`); links to `/ideas/[id]`
- [ ] T030 Create `src/app/api/ideas/[id]/route.ts` — `GET`: fetch idea by id; if submitter, enforce ownership (return 403 if not owner); if admin, enforce draft 403 (CL-010); include evaluation notes if present; `PATCH`: owner only, draft→submitted transition (Phase 4)
- [ ] T031 Create `src/app/(submitter)/dashboard/page.tsx` — server component; fetches own ideas via `GET /api/ideas`; renders list of `<IdeaCard>`; renders empty state with "Submit your first idea" `<Button>` if empty
- [ ] T032 Create `src/app/ideas/[id]/page.tsx` — server component; fetches idea detail; shows all fields, `<StatusBadge>`, `formatDateTime()` for dates, evaluation notes section (visible if evaluation exists), attachment download link

**Checkpoint ✅**: All 5 acceptance scenarios in User Story 3 pass manual walkthrough.
Commit: `feat(ideas): listing pages and detail view`

---

## Phase 5 — Admin Idea Management (US4 — Priority: P2)

**Goal**: Admin sees all ideas from all submitters; can filter by status; can open any idea detail.

**Manual Test**: Log in as `admin@epam.com` → `/admin/ideas` → all ideas visible with submitter names → filter by `submitted` → only submitted ideas shown → click idea → detail page shows submitter name.

- [ ] T033 Create `src/app/(admin)/layout.tsx` — server component; verifies `role === 'admin'`; redirects to `/dashboard` otherwise
- [ ] T034 Create `src/app/(admin)/admin/page.tsx` — server component; queries count of ideas per status; renders 4 stat `<Card>` components (Submitted, Under Review, Accepted, Rejected) with counts and `--color-status-*` accent colours
- [ ] T035 Create `src/app/(admin)/admin/ideas/page.tsx` — server component; accepts `?status=` query param; fetches filtered ideas (all if no filter, drafts excluded); renders list of `<IdeaCard>` with submitter name visible
- [ ] T036 [P] Create `src/components/StatusFilter.tsx` — `"use client"` `<Select>` that updates URL `?status=` param via `useRouter`; rendered as client island inside T035 page

**Checkpoint ✅**: All 4 acceptance scenarios in User Story 4 pass manual walkthrough.
Commit: `feat(admin): admin dashboard and idea list with status filter`

---

## Phase 6 — Admin Evaluation Workflow (US5 — Priority: P2)

**Goal**: Admin evaluates an idea — chooses decision + optional notes — idea status updates immediately.

**Manual Test**: Log in as admin → `/admin/ideas` → click a `submitted` idea → click "Evaluate" → select `accepted`, add notes → submit → status badge updates to green → submitter logs in and sees updated status + notes.

- [ ] T037 Create `src/app/api/ideas/[id]/evaluate/route.ts` — `POST`: verify `role === 'admin'`, validate with `EvaluationSchema` (Zod: decision required and one of `under_review | accepted | rejected` — **not** `submitted`), notes optional string; upsert `evaluations` row (`INSERT OR REPLACE`), update `ideas.status` + `ideas.updated_at`, return `200 { status }`
- [ ] T038 Create `src/components/EvaluationForm.tsx` — `"use client"` — shadcn `<Form>`: Decision `<Select>` (under_review / accepted / rejected, required), Notes `<Textarea>` (optional); submits to `POST /api/ideas/[id]/evaluate`; shows inline error if decision missing; shows success toast; refreshes page on success
- [ ] T039 Create `src/app/(admin)/admin/ideas/[id]/evaluate/page.tsx` — server component; fetches idea detail (including existing evaluation if any); renders idea summary + `<EvaluationForm>` pre-filled with current decision/notes if re-evaluating

**Checkpoint ✅**: All 6 acceptance scenarios in User Story 5 pass manual walkthrough.
Commit: `feat(admin): evaluation workflow with status transitions`

---

## Phase 7 — Smart Submission Forms (US6 — Priority: P3)

**Goal**: Category dropdown triggers additional required fields specific to that category.

**Manual Test**: Log in as submitter → `/submit` → select "Technical" → see "Technology Stack" + "Implementation Complexity" fields → switch to "Process Improvement" → old fields disappear, new ones appear → submit without filling them → validation blocks.

- [ ] T040 Extend `IdeaSchema` in `validations.ts` — add `category_metadata` as `z.record(z.string()).optional()`; add per-category `superRefine` validation rules
- [ ] T041 Update `POST /api/ideas` — serialize extra fields to `category_metadata` JSON column
- [ ] T042 Update `src/components/IdeaForm.tsx` — watch `category` field value; conditionally render extra fields per category (Technical: Technology Stack + Implementation Complexity; Process Improvement: Affected Department + Estimated Time Saving; Client Solutions: Target Client Segment + Revenue Impact); clear extra values on category change (CL-008)
- [ ] T043 Update `src/app/ideas/[id]/page.tsx` — parse and display `category_metadata` fields in detail view

**Checkpoint ✅**: All 5 acceptance scenarios in User Story 6 pass manual walkthrough.
Commit: `feat(phase-2): dynamic category-based form fields`

---

## Phase 8 — Multi-Media Attachments (US7 — Priority: P3)

**Goal**: Up to 5 file attachments per idea; image previews inline on detail page.

**Manual Test**: Submit idea with 3 attachments (1 image, 1 PDF, 1 PPTX) → detail page shows image thumbnail, PDF/PPTX file icons with download links → try 6th file → error shown.

- [ ] T044 Update `src/app/api/ideas/[id]/attachments/route.ts` — `POST`: enforce max 5 attachments per idea (count existing rows first)
- [ ] T045 Create `src/components/AttachmentList.tsx` — `"use client"` — images as `<img>` thumbnails, other types as file icon + filename + size + download `<Button>`
- [ ] T046 Update `src/components/IdeaForm.tsx` — replace single file `<Input>` with multi-file `<input multiple>`; list selected files with name + size; show "Maximum 5 attachments" error if exceeded
- [ ] T047 Update `src/app/ideas/[id]/page.tsx` — replace single attachment link with `<AttachmentList>`

**Checkpoint ✅**: All 5 acceptance scenarios in User Story 7 pass manual walkthrough.
Commit: `feat(phase-3): multiple file attachments with preview`

---

## Phase 9 — Draft Management (US8 — Priority: P3)

**Goal**: Submitters save drafts, return later to edit, and submit when ready.

**Manual Test**: Log in as submitter → `/submit` → fill partial form → "Save Draft" → `/dashboard` shows draft in "My Drafts" section → click Edit → form pre-filled → Submit → idea moves to main list with `submitted` status → log in as admin → draft not visible.

- [ ] T048 Verify `draft` is in the status CHECK in `schema.sql` (already included — just confirm)
- [ ] T049 Update `POST /api/ideas` — accept `status: 'draft'` in body; `GET /api/ideas` excludes drafts from admin results
- [ ] T050 Update `GET /api/ideas/[id]` — return 403 if requester is admin and idea status is `draft` (CL-010)
- [ ] T051 Implement `PATCH /api/ideas/[id]` — submitter (owner only) can update title, description, category, category_metadata, and transition status `draft` → `submitted`; validated with Zod
- [ ] T052 Update `src/app/(submitter)/dashboard/page.tsx` — separate query for drafts; render "My Drafts" section; each draft card shows Edit `<Button>` linking to `/submit?draft=[id]`
- [ ] T053 Update `src/app/(submitter)/submit/page.tsx` — read `?draft=[id]` search param; if present, pre-fill `<IdeaForm>`; "Save Draft" calls `PATCH` with `status: 'draft'`; "Submit" calls `PATCH` with `status: 'submitted'`

**Checkpoint ✅**: All 5 acceptance scenarios in User Story 8 pass manual walkthrough.
Commit: `feat(phase-4): draft management — save, edit, and submit drafts`

---

## Final Verification & Deliverables

### Code Quality
- [ ] T054 Manual walkthrough: run through all P1 acceptance scenarios (US1–US3) end-to-end with a fresh DB
- [ ] T055 Manual walkthrough: run through P2 scenarios (US4–US5) as admin
- [ ] T056 Run `npm run build` — zero errors, zero warnings
- [ ] T057 Run `npm run lint` — zero errors
- [ ] T058 Verify `.env.local`, `innovatepam.db`, and `uploads/` are not tracked by git (`git status`)

### Documentation
- [ ] T059 Complete `PROJECT_SUMMARY.md` using the template from `final-deliverables.md` — fill in all sections:
  - Overview (2-3 sentences)
  - Phases Completed checklist (tick what you built)
  - Technology Stack
  - Key Architecture Decisions (1-2 decisions)
  - Challenges & Solutions (at least 2)
  - AI Collaboration (tools used, what worked, what could improve)
  - Time Breakdown table (fill in actual hours per phase)
  - Reflection (Key Learning, What I'd Do Differently, SDD vs Vibe Coding, AI Collaboration Insight)
  - Submitted by / Date / Cohort at the bottom
- [ ] T060 Update `README.md` with final setup instructions: `npm install`, seed command (`npx tsx src/lib/db/seed.ts`), `npm run dev`, test accounts (`admin@epam.com / Admin1234!`, `alice@epam.com / Test1234!`)
- [ ] T061 Commit all SpecKit artifacts + docs: `git add CONSTITUTION.md spec.md plan.md tasks.md PROJECT_SUMMARY.md README.md && git commit -m "docs: add speckit artifacts and project summary"` then `git push`

### Lightning Demo Prep (3 minutes)
- [ ] T062 Pre-load demo data: run seed on demo machine; submit 2–3 sample ideas as `alice@epam.com`; evaluate 1 as `admin@epam.com`
- [ ] T063 Rehearse the demo flow once: (30s) intro → (2min) login + submit + admin evaluates + submitter sees result → (30s) one SpecKit insight
- [ ] T064 Fallback ready: if live demo breaks, walk through `PROJECT_SUMMARY.md` and commit history

### Final Push
- [ ] T065 `git push` all commits; confirm repo is accessible (public or instructor has access)
- [ ] T066 Verify commit history has **multiple commits** with descriptive messages throughout the sprint — not one giant commit at the end

---

## Task Summary

| Phase | Tasks | Priority | Blocks |
|---|---|---|---|
| Pre-flight | T000a–T000e | — | sprint kickoff |
| 0 — Scaffold | T001–T010 | — | everything |
| 1 — Database | T011–T014 | — | everything |
| 2 — Auth | T015–T022 | P1 🎯 | all features |
| 3 — Submission | T023–T027 | P1 🎯 | dashboard, admin |
| 4 — Listing | T028–T032 | P1 🎯 | — |
| 5 — Admin view | T033–T036 | P2 | evaluation |
| 6 — Evaluation | T037–T039 | P2 | — |
| 7 — Smart forms | T040–T043 | P3 | — |
| 8 — Multi-media | T044–T047 | P3 | — |
| 9 — Drafts | T048–T053 | P3 | — |
| Final | T054–T066 | — | — |

**Total**: 66 tasks · **[P]** = can run in parallel with other tasks in the same phase
