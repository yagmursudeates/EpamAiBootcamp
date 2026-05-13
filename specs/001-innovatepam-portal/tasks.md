# Tasks: InnovatEPAM Portal

**Input**: Design documents from `specs/001-innovatepam-portal/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅

**Tests**: None — no automated tests per plan specification.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story label (US1–US8)
- Exact file paths included in all descriptions

---

## Phase 1: Setup — Project Scaffold

**Purpose**: Initialize the Next.js app, install dependencies, configure tooling.

- [ ] T001 Scaffold Next.js app: `npx create-next-app@latest innovatepam --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` at project root
- [ ] T002 Initialize shadcn/ui: `npx shadcn@latest init` — select New York style, CSS variables on; verify `components.json` created
- [ ] T003 Install runtime deps: `npm install better-sqlite3 bcryptjs next-auth zod date-fns uuid sonner`
- [ ] T004 [P] Install dev deps: `npm install -D @types/better-sqlite3 @types/bcryptjs prettier prettier-plugin-tailwindcss`
- [ ] T005 [P] Create `.prettierrc` at project root with `{ "plugins": ["prettier-plugin-tailwindcss"] }`
- [ ] T006 Configure `@theme` design tokens in `src/app/globals.css` (brand + status colour tokens, `--radius-card`)
- [ ] T007 [P] Create `uploads/` directory at project root; update `.gitignore` to exclude `uploads/`, `innovatepam.db`, `.env.local`, `.github/`
- [ ] T008 [P] Create `.env.local` with `NEXTAUTH_SECRET` (generate via `openssl rand -base64 32`) and `NEXTAUTH_URL=http://localhost:3000`
- [ ] T009 Install required shadcn components: `npx shadcn@latest add button input textarea select form card badge dialog skeleton sonner dropdown-menu alert-dialog`
- [ ] T010 Verify scaffold: `npm run lint && npm run build` passes with zero errors

---

## Phase 2: Foundational — Database, Auth Infrastructure & Shared Utilities

**Purpose**: Core infrastructure that MUST be complete before any user story work begins.

⚠️ **CRITICAL**: No user story implementation starts until this phase is complete.

- [ ] T011 Create `src/lib/db/schema.sql` with all four `CREATE TABLE IF NOT EXISTS` statements (users, ideas, attachments, evaluations) per data-model.md
- [ ] T012 [P] Create `src/lib/db/index.ts` — `better-sqlite3` singleton that opens `innovatepam.db`, reads and executes `schema.sql` on import (idempotent)
- [ ] T013 [P] Create `src/lib/utils.ts` with `cn()` (clsx + tailwind-merge), `formatDate(iso)` → `'MMM d, yyyy'`, `formatDateTime(iso)` → `'MMM d, yyyy HH:mm'` using `date-fns`
- [ ] T014 [P] Create `src/lib/validations.ts` with all four Zod schemas: `RegisterSchema`, `LoginSchema`, `IdeaSchema`, `EvaluationSchema`
- [ ] T015 Create `src/lib/auth.ts` — NextAuth v5 config: Credentials provider, `bcryptjs.compare`, JWT strategy, `{ id, name, email, role }` token, 24 h expiry
- [ ] T016 Create `src/app/api/auth/[...nextauth]/route.ts` — export `{ GET, POST }` handlers from NextAuth
- [ ] T017 Create `src/middleware.ts` — role-based route guards: `/admin/*` → admin only (else `/dashboard`); `/dashboard,/submit,/ideas/*` → authenticated (else `/login`); `/login,/register` → redirect if authenticated
- [ ] T018 [P] Create `src/lib/db/seed.ts` — insert admin `admin@epam.com / Admin1234!`, submitters `alice@epam.com / Test1234!` and `bob@epam.com / Test1234!` using bcryptjs; idempotent (skip if email exists)
- [ ] T019 [P] Create `src/components/Navbar.tsx` — shows app name, user name, role badge, and Logout button; `"use client"` for sign-out action
- [ ] T020 Update `src/app/layout.tsx` — add `<Navbar>`, `<Toaster>` (sonner), and root font

**Checkpoint**: DB schema runs, auth config is wired, middleware guards are active, seed populates test accounts.

---

## Phase 3: User Story 1 — Employee Registration & Login (Priority: P1) 🎯 MVP Start

**Goal**: Any visitor can register; registered users log in and land on role-appropriate dashboards.

**Independent Test**: Register a new account → confirm redirect to `/dashboard`. Log out. Log in as `admin@epam.com` → confirm redirect to `/admin`. Try wrong password → confirm error message.

- [ ] T021 [P] [US1] Create `src/app/(auth)/register/page.tsx` — `"use client"` form with `react-hook-form` + `RegisterSchema` zodResolver; calls `POST /api/users`; on success redirects to `/dashboard`
- [ ] T022 [P] [US1] Create `src/app/api/users/route.ts` — `POST`: parse `RegisterSchema`, hash password with `bcryptjs` (rounds 12), insert into `users` table via db singleton, return 201 or 409 on duplicate email
- [ ] T023 [US1] Create `src/app/(auth)/login/page.tsx` — `"use client"` form with `react-hook-form` + `LoginSchema` zodResolver; calls `signIn('credentials', ...)`; role-aware redirect (CL-001, CL-009)
- [ ] T024 [US1] Create `src/app/page.tsx` — server component that redirects to `/login` (or role destination if session exists)
- [ ] T025 [US1] Create `src/app/(submitter)/layout.tsx` — server component that verifies session; redirects unauthenticated users to `/login`
- [ ] T026 [US1] Create `src/app/(admin)/layout.tsx` — server component that verifies session and `role === 'admin'`; redirects submitters to `/dashboard`

**Checkpoint**: US1 fully functional — register, login, logout, role-redirect, route guard all work.

---

## Phase 4: User Story 2 — Idea Submission (Priority: P1)

**Goal**: A logged-in user can submit an idea with an optional file attachment and receive confirmation.

**Independent Test**: Log in as `alice@epam.com` → open `/submit` → fill title, description, category → attach a PDF → submit → confirm redirect to `/dashboard` with success toast, idea listed with status `submitted`.

- [ ] T027 [P] [US2] Create `src/components/IdeaForm.tsx` — `"use client"` form using `react-hook-form` + `IdeaSchema`; fields: title (`Input`), description (`Textarea`), category (`Select`), file picker (`Input type="file"`); submit calls `POST /api/ideas` then optionally `POST /api/ideas/[id]/attachments`
- [ ] T028 [US2] Create `src/app/(submitter)/submit/page.tsx` — server component that renders `<IdeaForm>` with page title; redirects to `/dashboard` + success toast (CL-003) after submit
- [ ] T029 [US2] Create `src/app/api/ideas/route.ts` — `POST`: verify session, parse `IdeaSchema`, insert idea with UUID + `submitter_id` from session, return 201; `GET`: placeholder (implemented in Phase 5)
- [ ] T030 [US2] Create `src/app/api/ideas/[id]/attachments/route.ts` — `POST`: verify session + ownership, parse `multipart/form-data`, validate MIME type against allowlist (CL-005) and size ≤ 10 MB, sanitise filename, write to `uploads/<idea-id>/<uuid>-<filename>`, insert into `attachments` table, return 201

**Checkpoint**: US2 functional — idea created, file uploaded, status `submitted`, toast shown, redirect works.

---

## Phase 5: User Story 3 — Idea Listing & Status Tracking (Priority: P1)

**Goal**: Submitters see their own ideas with status badges on the dashboard; clicking opens the full detail view.

**Independent Test**: After submitting an idea, visit `/dashboard` → see idea card with status badge → click → detail page shows full content including attachment download link and evaluation notes if present.

- [ ] T031 [P] [US3] Create `src/components/StatusBadge.tsx` — maps `status` value to `--color-status-*` `@theme` token; renders shadcn `<Badge>` with colour and label
- [ ] T032 [P] [US3] Create `src/components/IdeaCard.tsx` — displays title, category, `<StatusBadge>`, `formatDate(createdAt)`; wraps in shadcn `<Card>`; links to `/ideas/[id]`
- [ ] T033 [US3] Implement `GET` handler in `src/app/api/ideas/route.ts` — submitter: return own non-draft ideas (optionally filtered by `?status=`); admin: return all non-draft ideas
- [ ] T034 [US3] Create `src/app/api/ideas/[id]/route.ts` — `GET`: verify session, enforce ownership (submitter) or admin; return idea + evaluation + attachments; 403 for admin accessing draft (CL-010); 404 if not found
- [ ] T035 [US3] Create `src/app/api/ideas/[id]/attachments/[attachmentId]/route.ts` — `GET`: verify session, verify owner or admin (CL-007), stream file from disk with correct `Content-Type` and `Content-Disposition`
- [ ] T036 [US3] Create `src/app/(submitter)/dashboard/page.tsx` — server component; fetches own ideas via db; renders list of `<IdeaCard>`; shows `<Skeleton>` during load; shows empty state with "Submit your first idea" link if no ideas
- [ ] T037 [US3] Create `src/app/ideas/[id]/page.tsx` — shared server component; fetches idea + evaluation + attachments; renders full detail with `<StatusBadge>`, `formatDateTime`, evaluation notes section, attachment list with download links; 403/404 handling

**Checkpoint**: US3 functional — dashboard lists ideas, status badges coloured correctly, detail view complete.

---

## Phase 6: User Story 4 — Admin Idea Management (Priority: P2)

**Goal**: Admin sees all submitted ideas (not drafts), can filter by status, and opens full idea details.

**Independent Test**: Log in as `admin@epam.com` → visit `/admin` → see status count cards → visit `/admin/ideas` → see all non-draft ideas from all submitters → filter by `submitted` → only matching ideas shown.

- [ ] T038 [P] [US4] Create `src/components/StatusFilter.tsx` — `"use client"` select with all status options + "All"; updates URL query param `?status=` using `useRouter`
- [ ] T039 [US4] Create `src/app/(admin)/admin/page.tsx` — server component; queries idea counts grouped by status; renders `<Card>` grid with counts (submitted, under_review, accepted, rejected); link to `/admin/ideas`
- [ ] T040 [US4] Create `src/app/(admin)/admin/ideas/page.tsx` — server component; reads `?status=` from `searchParams`; queries all non-draft ideas (with filter); renders table/list with title, submitter name, category, `<StatusBadge>`, `formatDate`; links to `/admin/ideas/[id]/evaluate`

**Checkpoint**: US4 functional — admin can view and filter all ideas; submitters blocked from `/admin`.

---

## Phase 7: User Story 5 — Admin Evaluation Workflow (Priority: P2)

**Goal**: Admin evaluates an idea (accepts / rejects / marks under review) and the status updates immediately.

**Independent Test**: Admin opens a `submitted` idea at `/admin/ideas/[id]/evaluate` → selects `accepted` + adds notes → submits → status badge in list updates → submitter sees updated status and notes on detail page.

- [ ] T041 [P] [US5] Create `src/components/EvaluationForm.tsx` — `"use client"` form with `react-hook-form` + `EvaluationSchema`; decision `<Select>` with options `under_review`, `accepted`, `rejected`; notes `<Textarea>`; calls `POST /api/ideas/[id]/evaluate`; shows toast on success
- [ ] T042 [US5] Create `src/app/api/ideas/[id]/evaluate/route.ts` — `POST`: verify session + `role === 'admin'`, parse `EvaluationSchema`, run DB transaction: upsert `evaluations` row (INSERT OR REPLACE) + update `ideas.status` + `ideas.updated_at`, return 200
- [ ] T043 [US5] Create `src/app/(admin)/admin/ideas/[id]/evaluate/page.tsx` — server component; fetches idea + existing evaluation (if any); renders idea summary + `<EvaluationForm>` pre-filled with existing decision/notes; redirects to `/admin/ideas` with toast on success

**Checkpoint**: US5 functional — evaluation upserts correctly, idea status updates atomically, evaluator notes visible to submitter.

---

## Phase 8: User Story 6 — Smart Submission Forms (Priority: P3)

**Goal**: Submission form reveals category-specific required fields dynamically; values stored in `category_metadata`.

**Independent Test**: Select "Technical" → "Technology Stack" and "Implementation Complexity" appear; switch to "Process Improvement" → Technical fields gone, new fields appear; submit without filling a required field → inline validation error.

- [ ] T044 [US6] Update `src/components/IdeaForm.tsx` — add `useWatch` on category field; render category-specific field groups conditionally based on selected value; clear category-specific values on category change (CL-008)
- [ ] T045 [US6] Update `src/lib/validations.ts` — extend `IdeaSchema` with `.superRefine()` to require category-specific fields when their category is selected
- [ ] T046 [US6] Update `src/app/api/ideas/route.ts` POST handler — serialise `categoryMetadata` to JSON string before inserting into `category_metadata` column
- [ ] T047 [US6] Update `src/app/ideas/[id]/page.tsx` — parse and display `category_metadata` fields in a "Category Details" section when present

**Checkpoint**: US6 functional — smart fields appear/disappear, validate correctly, persist and display on detail page.

---

## Phase 9: User Story 7 — Multi-Media Attachments (Priority: P3)

**Goal**: Up to 5 files of any allowed type per idea; images preview inline on detail page; other files show download link.

**Independent Test**: Attach 3 files (PDF, PNG, DOCX) → all listed before submit → after submit, detail page shows PNG as thumbnail, others as download links → trying a 6th file shows error.

- [ ] T048 [P] [US7] Create `src/components/AttachmentList.tsx` — renders image files as `<img>` thumbnails (via download route); non-images as file icon + filename + download link; `"use client"` for inline preview
- [ ] T049 [US7] Update `src/components/IdeaForm.tsx` — replace single file picker with multi-file input; show selected file list with name + size; enforce max 5 client-side with error message
- [ ] T050 [US7] Update `src/app/api/ideas/[id]/attachments/route.ts` POST handler — accept array of files from `formData.getAll('file')`; enforce ≤ 5 total (existing + new) per idea; validate each file independently; write each to disk; insert all rows
- [ ] T051 [US7] Update `src/app/ideas/[id]/page.tsx` — replace inline attachment links with `<AttachmentList>` component

**Checkpoint**: US7 functional — multiple uploads work, image previews render, 5-file cap enforced.

---

## Phase 10: User Story 8 — Draft Management (Priority: P3)

**Goal**: Submitters can save incomplete ideas as drafts, edit them later, and submit when ready.

**Independent Test**: Click "Save Draft" → idea saved with status `draft` → revisit `/dashboard`, find it in "My Drafts" → click "Edit" → form pre-filled → click "Submit" → idea moves to main list with status `submitted`; admin cannot see or access draft.

- [ ] T052 [US8] Update `src/app/api/ideas/route.ts` POST handler — support `?draft=true` query param; set `status = 'draft'` when present
- [ ] T053 [US8] Add `PATCH` handler in `src/app/api/ideas/[id]/route.ts` — verify session + ownership + `status === 'draft'`; accept partial `IdeaSchema` fields; update row + `updated_at`; support `{ status: 'submitted' }` body to submit the draft
- [ ] T054 [US8] Update `src/components/IdeaForm.tsx` — add "Save Draft" button that calls `POST /api/ideas?draft=true`; when editing a draft (`ideaId` prop present), calls `PATCH /api/ideas/[id]`; "Submit" button on draft calls `PATCH` with `status: 'submitted'`
- [ ] T055 [US8] Update `src/app/(submitter)/dashboard/page.tsx` — add separate `GET /api/ideas?status=draft` query; render "My Drafts" section below main idea list with edit links
- [ ] T056 [US8] Update `src/app/api/ideas/route.ts` GET handler — when `?status=draft`, return only caller's draft ideas (submitters only; admins receive empty array for draft filter)
- [ ] T057 [US8] Verify `src/app/api/ideas/[id]/route.ts` GET — confirms 403 returned when admin requests a draft idea (CL-010)

**Checkpoint**: US8 functional — save/edit/submit draft cycle works end-to-end; drafts hidden from admins.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Loading/empty/error states, accessibility, build verification, and final deliverables.

- [ ] T058 [P] Add loading states — create `loading.tsx` files in `src/app/(submitter)/dashboard/`, `src/app/(admin)/admin/ideas/`, and `src/app/ideas/[id]/` using `<Skeleton>` components
- [ ] T059 [P] Add error boundaries — create `error.tsx` files in `src/app/(submitter)/`, `src/app/(admin)/`, and `src/app/ideas/[id]/` with user-friendly error messages
- [ ] T060 [P] Verify WCAG AA contrast — audit all `<StatusBadge>` colours and brand tokens against background; fix any failing pairs
- [ ] T061 [P] Verify mobile responsiveness — check `/dashboard`, `/submit`, `/admin/ideas`, and `/ideas/[id]` at 375 px viewport; fix any layout breaks
- [ ] T062 Run `npm run lint` and `npm run build` — fix all lint errors and type errors until both pass cleanly
- [ ] T063 Run seed script `npx tsx src/lib/db/seed.ts` — verify all three test accounts are created; confirm login works for each
- [ ] T064 Manual acceptance walkthrough — step through every Given/When/Then scenario in `specs/001-innovatepam-portal/quickstart.md` for all implemented phases; document any failures
- [ ] T065 Create `PROJECT_SUMMARY.md` at project root — include: project title, tech stack table, implemented user stories with status, API route list, test account credentials, setup instructions (install → seed → dev), known limitations
- [ ] T066 Final git commit — stage all files, run `git add -A && git commit -m "feat(portal): complete InnovatEPAM Portal implementation"`, verify commit history with `git log --oneline`

---

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1) → Phases 4–5 (US2, US3) can run in parallel
                                                         → Phase 6 (US4) → Phase 7 (US5)
                                                         → Phase 8 (US6) depends on Phase 4 (US2)
                                                         → Phase 9 (US7) depends on Phase 4 (US2)
                                                         → Phase 10 (US8) depends on Phase 4 (US2)
Phase 11 (Polish) → depends on all prior phases
```

**User Story dependency order**:

- US1 (auth) — no story dependencies; only Phase 2 foundation required
- US2 (submission) — requires US1
- US3 (listing/detail) — requires US2
- US4 (admin listing) — requires US1 and US2
- US5 (evaluation) — requires US4
- US6 (smart forms) — requires US2; independent of US3–US5
- US7 (multi-media) — requires US2; independent of US3–US6
- US8 (drafts) — requires US2; independent of US3–US7

---

## Parallel Execution Examples

Within each phase, tasks marked **[P]** can be worked on simultaneously by different developers (or in separate Copilot agent sessions), since they touch different files.

**Phase 2 parallel batch**: T012, T013, T014, T018, T019 can all start at the same time.

**Phase 3 parallel batch** (after T022 is done): T021 (register page) and T022 (register API) are independent files.

**Phase 5 parallel batch**: T031 (StatusBadge) and T032 (IdeaCard) are independent components.

**Phase 6 parallel batch**: T038 (StatusFilter) can be built while T033 (GET /api/ideas) is being implemented.

---

## Implementation Strategy

**Suggested MVP scope** (ship to instructor as Phase 1 demo): Complete through Phase 7 (US1–US5).

This delivers:

- Employee registration and login
- Idea submission with single file upload
- Submitter dashboard with status tracking
- Admin idea list with status filter
- Admin evaluation workflow

P3 features (Phases 8–10: smart forms, multi-media, drafts) are independent enhancements that can be completed without blocking US1–US5 delivery.

---

## Format Validation

All tasks follow the mandatory checklist format:

- ✅ Every task starts with `- [ ]`
- ✅ Every task has a sequential ID (T001–T066)
- ✅ `[P]` present on parallelizable tasks only
- ✅ `[US#]` label on all user-story phase tasks (Phases 3–10); absent from setup/foundation/polish phases
- ✅ Every task includes an exact file path in its description
