# InnovatEPAM Portal — Test Tasks

> **Feature**: InnovatEPAM Portal (US-001 · US-002 · US-003)
> **Generated**: 2026-05-17
> **Approach**: TDD — tests are written before implementation (Constitution §1)
> **Framework**: Vitest v2+ / React Testing Library / Stryker (`@stryker-mutator/vitest-runner`)
> **Available docs**: us1-registration-login.md · us2-idea-submission.md · us3-idea-listing-status.md · ADR-001 · ADR-002 · ADR-003 · CONSTITUTION.md v1.4.0

---

## Phase 1: Test Infrastructure Setup

**Goal**: Establish the test harness before any story work begins. Every subsequent phase depends on this phase being complete.

- [x] T001 Create `vitest.config.ts` at project root — set environment `jsdom`, setupFiles `src/__tests__/setup.ts`, coverage provider `v8`, and `coverage.thresholds` (lines: 80, branches: 75, functions: 80)
- [x] T002 Create global test setup file `src/__tests__/setup.ts` — import `@testing-library/jest-dom`; add `vi.mock('next-auth')` with a default export returning `null` session
- [x] T003 Create `stryker.config.ts` at project root — set `vitest` runner, mutate `['src/lib/**/*.ts', 'src/app/api/**/*.ts']`, `thresholds.high: 75`, `thresholds.break: 60`
- [x] T004 Add npm scripts to `package.json`: `"test": "vitest"`, `"test:ci": "vitest run --coverage"`, `"test:unit": "vitest run src/__tests__/lib"`, `"test:integration": "vitest run src/__tests__/api"`, `"coverage": "vitest run --coverage"`, `"mutation": "npx stryker run"`

---

## Phase 2: Foundational Test Utilities

**Goal**: Shared helpers and typed fixtures consumed by all story phases. MUST be fully complete before starting Phase 3.

- [x] T005 Create `src/__tests__/helpers/db.ts` — export `createTestDb(): Database` (opens `:memory:` SQLite, applies full schema from `src/lib/db/schema.ts`) and `closeTestDb(db: Database): void`; each test suite calls `createTestDb()` in `beforeEach` and `closeTestDb()` in `afterEach`
- [x] T006 [P] Create `src/__tests__/helpers/auth.ts` — export `mockSession(overrides?: Partial<Session>): Session` returning a NextAuth session object with role `submitter` by default; used by `vi.mocked(getServerSession).mockResolvedValue(mockSession())`
- [x] T007 [P] Create `src/__tests__/fixtures/users.ts` — export typed constants `SUBMITTER_USER` and `ADMIN_USER`; all fields must match the `users` table schema (`id`, `name`, `email`, `password_hash`, `role`, `created_at`)
- [x] T008 [P] Create `src/__tests__/fixtures/ideas.ts` — export typed constants `SUBMITTED_IDEA`, `ACCEPTED_IDEA`, `REJECTED_IDEA`; fields match `ideas` table schema (`id`, `title`, `description`, `category`, `status`, `submitter_id`, `is_anonymous`, `created_at`, `updated_at`)
- [x] T009 [P] Create `src/__tests__/helpers/users.ts` — export `createTestUser(db: Database, overrides?: Partial<User>): User` that inserts a bcrypt-hashed user row using `SUBMITTER_USER` as base and returns the inserted record
- [x] T010 [P] Create `src/__tests__/helpers/ideas.ts` — export `insertTestIdea(db: Database, submitterId: string, overrides?: Partial<Idea>): Idea` that inserts an idea row using `SUBMITTED_IDEA` as base and returns the record

---

## Phase 3: US-001 — Employee Registration & Login

**Story goal**: Secure registration and role-based login for EPAM employees.

**Independent test criteria**: All AC-1 through AC-6 pass when running `npx vitest run src/__tests__/lib src/__tests__/api/auth src/__tests__/components/auth`

- [x] T011 [P] [US1] Write unit tests for Zod registration schema in `src/__tests__/lib/validations.test.ts` — `describe('registrationSchema')`:
  - `should accept valid name, email, and password ≥ 8 chars` (AC-1)
  - `should reject password shorter than 8 characters` (AC-1 min length)
  - `should reject missing name field` (AC-1 required)
  - `should reject malformed email address` (AC-1 email format)

- [x] T012 [P] [US1] Write unit tests for password hashing utility in `src/__tests__/lib/auth-utils.test.ts` — `describe('hashPassword')` and `describe('verifyPassword')`:
  - `should return a string that differs from the plaintext input`
  - `should return true when correct password is verified against its hash`
  - `should return false when incorrect password is verified against a hash`

- [x] T013 [US1] Write integration tests for `POST /api/auth/register` in `src/__tests__/api/auth/register.test.ts`:
  - `should return 201 and insert user with role submitter for a valid payload` (AC-1)
  - `should return 409 when email already exists in the database` (AC-2)
  - `should return 422 when Zod validation fails on the request body` (AC-1 guard)
  - Setup: `createTestDb()` in `beforeEach`; import route handler directly (no HTTP)

- [x] T014 [US1] Write integration tests for NextAuth credentials provider in `src/__tests__/api/auth/credentials.test.ts`:
  - `should return a user object with role submitter for valid submitter credentials` (AC-3)
  - `should return a user object with role admin for valid admin credentials` (AC-3)
  - `should return null when password does not match the stored hash` (AC-4)
  - `should return null when email is not registered` (AC-4)
  - Setup: `createTestDb()`; use `createTestUser()` and `ADMIN_USER` fixture

- [x] T015 [US1] Write component tests for `RegisterForm` in `src/__tests__/components/auth/RegisterForm.test.tsx`:
  - `should display inline error "Email already in use" when API responds with 409` (AC-2)
  - `should display validation error when password field has fewer than 8 characters` (AC-1)
  - `should call router.push("/dashboard") on successful 201 response` (AC-1)
  - Setup: `mockSession()` with `null` (unauthenticated); stub `fetch` with `vi.stubGlobal`

- [x] T016 [US1] Write component tests for `LoginForm` in `src/__tests__/components/auth/LoginForm.test.tsx`:
  - `should display "Invalid email or password" when signIn returns an error` (AC-4)
  - `should not navigate away from /login when credentials are incorrect` (AC-4)
  - Setup: mock `next-auth/react` `signIn` via `vi.mock`

- [x] T017 [US1] Write integration tests for auth middleware in `src/__tests__/api/auth/middleware.test.ts`:
  - `should redirect unauthenticated request for /dashboard to /login` (AC-6)
  - `should pass through an authenticated request for /dashboard without redirect` (AC-6 inverse)
  - Setup: stub `auth()` from `next-auth` to return `null` (unauthenticated) and a valid session (authenticated)

---

## Phase 4: US-002 — Idea Submission

**Story goal**: Logged-in submitters can create ideas with optional file attachments.

**Independent test criteria**: All AC-1 through AC-5 pass when running `npx vitest run src/__tests__/lib src/__tests__/api/ideas src/__tests__/components/ideas`

**Dependency**: Phase 2 helpers (`createTestUser`, `mockSession`, fixtures)

- [x] T018 [P] [US2] Extend unit tests in `src/__tests__/lib/validations.test.ts` — add `describe('ideaSchema')`:
  - `should accept valid title, description, and one of the five defined categories` (AC-1)
  - `should reject blank title` (AC-3)
  - `should reject blank description` (AC-3)
  - `should reject title longer than 100 characters` (AC-1 edge)
  - `should reject description longer than 2000 characters` (AC-1 edge)
  - `should reject a category value not in the defined enum` (AC-5)

- [x] T019 [P] [US2] Write unit tests for file attachment validation in `src/__tests__/lib/attachments.test.ts` — `describe('validateAttachment')`:
  - `should accept PDF, DOCX, PPTX, XLSX, PNG, JPG, JPEG, GIF, and MP4 MIME types` (AC-2)
  - `should reject a MIME type not in the allowlist` (AC-2 security)
  - `should accept a file whose size is exactly 10 MB` (AC-2 boundary)
  - `should reject a file whose size exceeds 10 MB` (AC-4)

- [x] T020 [US2] Write integration tests for `POST /api/ideas` (text-only payload) in `src/__tests__/api/ideas/create.test.ts`:
  - `should return 201 and create idea with status submitted for a valid payload` (AC-1)
  - `should return 422 when title is blank` (AC-3)
  - `should return 422 when description is blank` (AC-3)
  - `should return 422 when category is not one of the five allowed values` (AC-5)
  - `should return 401 when request is unauthenticated` (auth guard)
  - Setup: `createTestDb()`, `createTestUser()`, `mockSession()`; call route handler directly

- [x] T021 [US2] Extend `src/__tests__/api/ideas/create.test.ts` — add `describe('POST /api/ideas — file attachment')`:
  - `should store file metadata in the attachments table when a valid file is attached` (AC-2)
  - `should return 422 and not create an idea record when attached file exceeds 10 MB` (AC-4)
  - `should return 422 when attached file MIME type is not in the allowlist` (AC-2 security)
  - Stub `fs.writeFile` via `vi.spyOn(fs.promises, 'writeFile').mockResolvedValue()`; verify it is NOT called on rejection

- [x] T022 [US2] Write component tests for `IdeaSubmissionForm` in `src/__tests__/components/ideas/IdeaSubmissionForm.test.tsx`:
  - `should display inline error under the title field when title is empty on submit` (AC-3)
  - `should display inline error under the description field when description is empty on submit` (AC-3)
  - `should display "File must be under 10 MB" when user selects a file exceeding 10 MB` (AC-4)
  - `should render exactly 5 category options: Technical, Process Improvement, Client Solutions, Cost Reduction, Employee Experience` (AC-5)
  - Setup: `mockSession()` (authenticated submitter)

---

## Phase 5: US-003 — Idea Listing & Status Tracking

**Story goal**: Submitters see their own ideas on a dashboard and can navigate to full detail views with evaluation notes.

**Independent test criteria**: All AC-1 through AC-5 pass when running `npx vitest run src/__tests__/api/ideas src/__tests__/components/dashboard src/__tests__/components/ideas`

**Dependency**: Phase 2 helpers + Phase 4 `insertTestIdea()`

- [x] T023 [P] [US3] Write integration tests for `GET /api/ideas` in `src/__tests__/api/ideas/list.test.ts`:
  - `should return only ideas whose submitter_id matches the authenticated user` (AC-1)
  - `should not return ideas belonging to a different user` (AC-1 isolation)
  - `should return an empty array when the authenticated user has no ideas` (AC-2)
  - Setup: `createTestDb()`; insert two users with `createTestUser()`; insert ideas with `insertTestIdea()`; `mockSession()` scoped to one user

- [x] T024 [P] [US3] Write integration tests for `GET /api/ideas/[id]` in `src/__tests__/api/ideas/detail.test.ts`:
  - `should return the full idea detail with evaluations joined for the idea's owner` (AC-3)
  - `should return 403 when an authenticated user requests an idea they do not own` (security — US-003 technical notes)
  - `should return 404 for a non-existent idea id` (edge)
  - Setup: `createTestDb()`; two users; `insertTestIdea()`; `mockSession()` toggled between users

- [x] T025 [P] [US3] Write component tests for `StatusBadge` in `src/__tests__/components/ideas/StatusBadge.test.tsx`:
  - `should render with a green colour indicator when status prop is "accepted"` (AC-4)
  - `should render with a red colour indicator when status prop is "rejected"` (AC-5)
  - `should render with a neutral colour indicator when status prop is "submitted"`

- [x] T026 [P] [US3] Write component tests for `IdeaCard` in `src/__tests__/components/ideas/IdeaCard.test.tsx`:
  - `should render title, category, submission date, and a StatusBadge` (AC-1)
  - `should pass the correct status value to StatusBadge` (AC-1)
  - Uses `SUBMITTED_IDEA` fixture

- [x] T027 [US3] Write component tests for `Dashboard` page in `src/__tests__/components/dashboard/Dashboard.test.tsx`:
  - `should render one IdeaCard per idea returned by GET /api/ideas` (AC-1)
  - `should render the empty state with a "Submit your first idea" link when the API returns an empty array` (AC-2)
  - Setup: `mockSession()` (authenticated submitter); stub `fetch` for `GET /api/ideas` via `vi.stubGlobal`

- [x] T028 [US3] Write component tests for `IdeaDetailPage` in `src/__tests__/components/ideas/IdeaDetailPage.test.tsx`:
  - `should render title, description, category, status, submission date, and file attachment link` (AC-3)
  - `should display the evaluation notes section when status is "accepted"` (AC-4)
  - `should display the evaluation notes section when status is "rejected"` (AC-5)
  - `should hide the evaluation notes section when status is "submitted"` (AC-4/5 inverse)
  - Uses `ACCEPTED_IDEA`, `REJECTED_IDEA`, `SUBMITTED_IDEA` fixtures; `mockSession()`

---

## Phase 6: Quality Gates & Polish

**Goal**: Confirm the suite satisfies the constitution's coverage and mutation thresholds before any PR is raised.

- [x] T029 Run `npm run test:ci` and verify exit code is 0; confirm coverage summary shows line ≥ 80% and branch ≥ 75% (Constitution §2, §7)
- [x] T030 [P] Run `npx stryker run` against `src/lib/` and verify mutation score ≥ 75%; identify and fix any under-tested branches until threshold is met (Constitution §7 quality gate)
- [x] T031 [P] Audit every `it()` block across `src/__tests__/` for missing `expect` calls and for tautological assertions (`expect(x).toBe(x)`, `expect(true).toBe(true)`); fix or delete any violations (Constitution §7 anti-patterns)
- [x] T032 Verify pre-commit hook runs `npx tsc --noEmit` → `npm run lint` → `npx vitest run src/__tests__/lib` in sequence with non-zero exit on failure (Constitution §9 pre-commit hook)

---

## Testing Pyramid Analysis

**Scope**: test-writing tasks T011–T028 (18 tasks). Infrastructure T001–T010 and quality-gate T029–T032 excluded from distribution count.

| Layer                                   | Tasks | Task IDs                                 | % of test tasks | Target | Status                                           |
| --------------------------------------- | ----- | ---------------------------------------- | --------------- | ------ | ------------------------------------------------ |
| Unit — `src/__tests__/lib/`             | 4     | T011, T012, T018, T019                   | 22%             | ~70%   | ⚠ low (pure-function lib is small for 3 stories) |
| Component — `src/__tests__/components/` | 7     | T015, T016, T022, T025–T028              | 39%             | —      | ✅ RTL; no DB, no HTTP; counts as unit-level     |
| Integration — `src/__tests__/api/`      | 7     | T013, T014, T017, T020, T021, T023, T024 | 39%             | ~20%   | ⚠ above target; justified below                  |
| E2E — `e2e/`                            | 0     | —                                        | 0%              | ~10%   | ℹ deferred to Phase 2 per ADR-001                |

**Effective pyramid** (component tests counted at unit level, E2E slot unavailable):

- Unit + Component: 11 / 18 = **61%** (target after E2E deferral: ~78%)
- Integration: 7 / 18 = **39%** (target: ~22%)

**Why integration is above target**: All 3 stories are API-heavy (auth routes, idea CRUD, access control). The 10% E2E slot is also empty (deferred), so more weight falls on integration. This is expected for Phase 1; it will self-correct once E2E tests are added in Phase 2.

---

## Testing Pyramid View

Tasks grouped by layer (same tasks as Phases 3–5; alternate view for pyramid compliance checking).

### UNIT TESTS — `src/__tests__/lib/` (4 tasks · 22%)

_Pure functions only: Zod schemas, utilities, validators. No DB, no HTTP, no rendering._

- [x] T011 [P] [US1] Unit: Zod registration schema → `src/__tests__/lib/validations.test.ts`
- [x] T012 [P] [US1] Unit: Password hash/verify utility → `src/__tests__/lib/auth-utils.test.ts`
- [x] T018 [P] [US2] Unit: Zod idea schema → `src/__tests__/lib/validations.test.ts`
- [x] T019 [P] [US2] Unit: File attachment MIME + size validation → `src/__tests__/lib/attachments.test.ts`

### COMPONENT TESTS — `src/__tests__/components/` (7 tasks · 39%)

_RTL render + interaction tests. No DB, no HTTP; counts at unit level in the pyramid._

- [x] T015 [US1] Component: `RegisterForm` → `src/__tests__/components/auth/RegisterForm.test.tsx`
- [x] T016 [US1] Component: `LoginForm` → `src/__tests__/components/auth/LoginForm.test.tsx`
- [x] T022 [US2] Component: `IdeaSubmissionForm` → `src/__tests__/components/ideas/IdeaSubmissionForm.test.tsx`
- [x] T025 [P] [US3] Component: `StatusBadge` → `src/__tests__/components/ideas/StatusBadge.test.tsx`
- [x] T026 [P] [US3] Component: `IdeaCard` → `src/__tests__/components/ideas/IdeaCard.test.tsx`
- [x] T027 [US3] Component: `Dashboard` → `src/__tests__/components/dashboard/Dashboard.test.tsx`
- [x] T028 [US3] Component: `IdeaDetailPage` → `src/__tests__/components/ideas/IdeaDetailPage.test.tsx`

### INTEGRATION TESTS — `src/__tests__/api/` (7 tasks · 39%)

_Route handlers called directly (no HTTP). In-memory SQLite via `createTestDb()`. NextAuth mocked._

- [x] T013 [US1] Integration: `POST /api/auth/register` → `src/__tests__/api/auth/register.test.ts`
- [x] T014 [US1] Integration: NextAuth credentials provider → `src/__tests__/api/auth/credentials.test.ts`
- [x] T017 [US1] Integration: Auth middleware redirect → `src/__tests__/api/auth/middleware.test.ts`
- [x] T020 [US2] Integration: `POST /api/ideas` (text payload) → `src/__tests__/api/ideas/create.test.ts`
- [x] T021 [US2] Integration: `POST /api/ideas` (file attachment) → `src/__tests__/api/ideas/create.test.ts`
- [x] T023 [P] [US3] Integration: `GET /api/ideas` → `src/__tests__/api/ideas/list.test.ts`
- [x] T024 [P] [US3] Integration: `GET /api/ideas/[id]` → `src/__tests__/api/ideas/detail.test.ts`

### E2E TESTS — `e2e/` (0 tasks · 0% — deferred to Phase 2 per ADR-001)

_Playwright; planned for Phase 2. Placeholder file names for future reference:_

- `e2e/registration-login.spec.ts` — registration + role-based redirect flow _(Phase 2)_
- `e2e/idea-submission.spec.ts` — submit idea with file attachment flow _(Phase 2)_
- `e2e/idea-listing.spec.ts` — dashboard list + detail + status badge flow _(Phase 2)_

---

## Dependency Graph

```
Phase 1: Test Infrastructure (T001–T004)
    └── Phase 2: Foundational Utilities (T005–T010)
            ├── Phase 3: US-001 Auth (T011–T017) ─── independently runnable
            ├── Phase 4: US-002 Submission (T018–T022) ─── uses Phase 3 helpers
            └── Phase 5: US-003 Listing (T023–T028) ─── uses Phase 3 + 4 helpers
                    └── Phase 6: Quality Gates (T029–T032)
```

**Story completion order**: US-001 → US-002 → US-003 (matches 3SP → 5SP → 2SP priority)

**All stories are independently runnable** after Phase 2 completes.

---

## Parallel Execution Examples

**Phase 2**: T006, T007, T008, T009, T010 — all write different files, no intra-phase dependencies.

**Phase 3**: T011 + T012 in parallel (different files). T013–T017 are sequential only because they share setup context.

**Phase 4**: T018 + T019 in parallel (different files). T020 before T021 (T021 extends T020's file).

**Phase 5**: T023 + T024 in parallel; T025 + T026 in parallel.

**Phase 6**: T030 + T031 in parallel.

---

## Implementation Strategy

**MVP scope (US-001 only)**: Complete Phase 1 + Phase 2 + Phase 3 (T001–T017). Delivers a fully-tested auth system with 100% AC coverage for US-001.

**Incremental delivery**:

1. Phase 1–2: Test harness + shared utilities (est. < 1 hour, T001–T010)
2. Phase 3: Registration & login tests — 7 tasks, US-001 complete (T011–T017)
3. Phase 4: Idea submission tests — 5 tasks, US-002 complete (T018–T022)
4. Phase 5: Listing & status tests — 6 tasks, US-003 complete (T023–T028)
5. Phase 6: Quality validation — run tools, close gaps (T029–T032)

---

## Task Summary

| Metric                                      | Count                           |
| ------------------------------------------- | ------------------------------- |
| Total tasks                                 | 32                              |
| Phase 1 — Setup                             | 4 (T001–T004)                   |
| Phase 2 — Foundations                       | 6 (T005–T010)                   |
| Phase 3 — US-001 Auth                       | 7 (T011–T017)                   |
| Phase 4 — US-002 Submission                 | 5 (T018–T022)                   |
| Phase 5 — US-003 Listing                    | 6 (T023–T028)                   |
| Phase 6 — Quality Gates                     | 4 (T029–T032)                   |
| Parallelizable `[P]` tasks                  | 16                              |
| User stories with independent test criteria | 3                               |
| MVP scope                                   | Phase 1–3 (T001–T017, 17 tasks) |

---

## Feature 2: US-004 — Admin Idea Evaluation

> **Added**: 2026-05-17
> **Approach**: TDD — tests written before implementation (Constitution §1)
> **Story**: US-004 · EP-002 Idea Lifecycle & Management · 3 story points
> **Dependencies**: Phase 2 helpers (`createTestDb`, `createTestUser`, `insertTestIdea`, `mockSession`), US-001 (auth session + role fixture), US-002 (ideas table rows)

---

### Phase 7: US-004 — Admin Idea Evaluation

**Story goal**: Admins can accept or reject submitted ideas with optional notes; the idea status is updated, an evaluation record is upserted, and a notification row is inserted atomically in the same DB transaction.

**Independent test criteria**: All AC-1 through AC-6 pass when running `npx vitest run src/__tests__/lib/validations.test.ts src/__tests__/api/ideas/evaluate.test.ts`

- [x] T033 [P] [US4] Extend unit tests in `src/__tests__/lib/validations.test.ts` — add `describe('evaluationSchema')`:
  - `should accept { status: "accepted" }` (AC-1)
  - `should accept { status: "rejected", notes: "some feedback" }` (AC-1)
  - `should accept when notes field is omitted entirely` (AC-1 notes optional)
  - `should reject a status value not in ["accepted", "rejected"]` (AC-4)
  - `should reject when the status field is missing from the payload` (AC-4 edge)

- [x] T034 [P] [US4] Write integration tests for `POST /api/ideas/[id]/evaluate` in `src/__tests__/api/ideas/evaluate.test.ts`:
  - `should return 200 with updated idea when admin evaluates with status "accepted"` (AC-1, AC-2)
  - `should return 200 with updated idea when admin evaluates with status "rejected"` (AC-1, AC-2)
  - `should return 403 when session role is "submitter"` (AC-3)
  - `should return 422 when status value is not "accepted" or "rejected"` (AC-4)
  - `should return 404 when idea id does not exist in the database` (AC-5)
  - `should upsert evaluation record and return 200 when idea was already evaluated` (AC-6)
  - `should insert one notification row for the idea's submitter_id after a successful evaluation` (ADR-002 side effect)
  - Setup: `createTestDb()` in `beforeEach`; `createTestUser()` for both submitter and admin roles; `insertTestIdea()` seeded to submitter; `mockSession({ role: "admin" })` for happy-path cases; import route handler from `src/app/api/ideas/[id]/evaluate/route.ts` directly (no HTTP)

- [x] T035 [P] [US4] Add `evaluationSchema` to `src/lib/validations.ts` — export `evaluationSchema = z.object({ status: z.enum(["accepted", "rejected"]), notes: z.string().optional() })`; no other changes to the file

- [x] T036 [US4] Create `src/app/api/ideas/[id]/evaluate/route.ts` — export `POST` handler:
  - Call `getServerSession()` and return `403` if session is absent or `session.user.role !== "admin"`
  - Parse request body with `evaluationSchema.safeParse()`; return `422` with Zod error details on failure
  - Query `ideas` table by `params.id`; return `404` if no row found
  - Open a `db.transaction()` containing three writes:
    1. `UPDATE ideas SET status = ?, updated_at = ? WHERE id = ?`
    2. `INSERT OR REPLACE INTO evaluations (id, idea_id, evaluator_id, notes, created_at) VALUES (?, ?, ?, ?, ?)`
    3. `INSERT INTO notifications (id, user_id, idea_id, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)` — message format: `"Your idea \"<title>\" has been <status>"`
  - Return `200` with `{ idea: { id, title, status, evaluation_notes } }` where `evaluation_notes` is the `notes` value from the request body

---

## Feature 3: US-005 — In-App Notifications

> **Added**: 2026-05-17
> **Approach**: TDD — tests written before implementation (Constitution §1)
> **Story**: US-005 · EP-003 Engagement & Feedback · 4 story points
> **Dependencies**: Phase 2 helpers (`createTestDb`, `createTestUser`, `mockSession`), US-001 (auth), US-004 (evaluate route creates notification rows)
> **ADR**: ADR-002 (In-App Notifications — accepted; in-app only via SQLite polling, no email in Phase 2)

---

### Phase 8: US-005 — In-App Notifications

**Story goal**: Submitters see a notification bell showing unread alerts when their ideas are evaluated; they can mark individual or all notifications as read.

**Independent test criteria**: All AC-1 through AC-7 pass when running `npx vitest run src/__tests__/api/notifications src/__tests__/components/notifications`

**Dependency**: Phase 2 helpers (`createTestDb`, `createTestUser`, `mockSession`, fixtures) + T037 (notifications helper, must complete before T038–T040)

- [x] T037 Create `src/__tests__/helpers/notifications.ts` — export `insertTestNotification(db: Database, userId: string, overrides?: Partial<{ id: string; message: string; is_read: number; created_at: string }>): { id: string; user_id: string; message: string; is_read: number; created_at: string }` that inserts a row into the `notifications` table using safe defaults (`is_read: 0`, `created_at: new Date().toISOString()`, auto-generated `id` via `crypto.randomUUID()`, `message: "Your idea has been accepted"`) merged with `overrides`, and returns the inserted record

- [x] T038 [P] [US5] Write integration tests for `GET /api/notifications` in `src/__tests__/api/notifications/list.test.ts`:
  - `should return 200 with an array of notification objects (id, message, is_read, created_at) for the authenticated user only` (AC-1)
  - `should not include notifications belonging to a different user in the same database` (AC-2)
  - `should return 200 with an empty array when the authenticated user has no notifications` (AC-3)
  - `should return 401 when the request is unauthenticated` (AC-7)
  - Setup: `createTestDb()` in `beforeEach`; two users via `createTestUser()`; seed notifications via `insertTestNotification()`; `mockSession()` scoped to first user; import route handler from `src/app/api/notifications/route.ts` directly (no HTTP)

- [x] T039 [P] [US5] Write integration tests for `PATCH /api/notifications/[id]` in `src/__tests__/api/notifications/mark-read.test.ts`:
  - `should return 200 with the updated notification object where is_read is 1 when the owner marks it read` (AC-4)
  - `should return 403 when the notification's user_id does not match the authenticated session user` (AC-5)
  - `should return 401 when the request is unauthenticated` (AC-7)
  - Setup: `createTestDb()` in `beforeEach`; two users via `createTestUser()`; one `insertTestNotification()` per user; `mockSession()` toggled between users for ownership test; import route handler from `src/app/api/notifications/[id]/route.ts` directly (no HTTP)

- [x] T040 [P] [US5] Write integration tests for `PATCH /api/notifications` (bulk) in `src/__tests__/api/notifications/bulk-read.test.ts`:
  - `should return 200 and set is_read = 1 for all notifications belonging to the authenticated user` (AC-6)
  - `should not modify notifications belonging to a different user (isolation)` (AC-2)
  - `should return 401 when the request is unauthenticated` (AC-7)
  - Setup: `createTestDb()` in `beforeEach`; two users; multiple `insertTestNotification()` calls for each; `mockSession()` scoped to first user; request body `{ markAllRead: true }`; import route handler from `src/app/api/notifications/route.ts` directly (no HTTP)

- [x] T041 [US5] Write component tests for `NotificationBell` in `src/__tests__/components/notifications/NotificationBell.test.tsx`:
  - `should render a badge displaying the correct unread count when there are unread notifications` (AC-1 UI)
  - `should not render a count badge when all notifications have is_read = 1` (AC-3 UI)
  - `should call PATCH /api/notifications with body { markAllRead: true } when the bell button is clicked` (AC-6 UI)
  - Setup: `mockSession()` (authenticated submitter); stub `fetch` via `vi.stubGlobal` — `GET /api/notifications` returns an array with mixed read/unread items; `PATCH /api/notifications` resolves `{ ok: true }`; use `@testing-library/react` `render` and `fireEvent`

- [x] T042 [P] [US5] Create `src/app/api/notifications/route.ts` — export `GET` and `PATCH` handlers:
  - `GET`: call `getServerSession()`; return `Response.json({error:'Unauthorized'}, {status:401})` if no session; query `SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC` with `session.user.id`; return `Response.json(rows, {status:200})`
  - `PATCH`: call `getServerSession()`; return `401` if no session; parse request body and verify `markAllRead === true`; run `UPDATE notifications SET is_read = 1 WHERE user_id = ?` with `session.user.id`; return `Response.json({ ok: true }, {status:200})`

- [x] T043 [P] [US5] Create `src/app/api/notifications/[id]/route.ts` — export `PATCH` handler:
  - Call `getServerSession()`; return `Response.json({error:'Unauthorized'},{status:401})` if no session
  - Query `SELECT * FROM notifications WHERE id = ?` using `params.id`; return `Response.json({error:'Not Found'},{status:404})` if no row found
  - Return `Response.json({error:'Forbidden'},{status:403})` if `notification.user_id !== session.user.id` (IDOR prevention per ADR-002 security note)
  - Run `UPDATE notifications SET is_read = 1 WHERE id = ?`; re-query the row; return `Response.json(updatedNotification, {status:200})`

- [x] T044 [US5] Create `src/components/notifications/NotificationBell.tsx` — client component (`'use client'`):
  - On mount: fetch `GET /api/notifications`; store results in state; derive `unreadCount` from items where `is_read === 0`
  - Render a bell icon `<button>` with an accessible `aria-label`; when `unreadCount > 0` overlay a `<span>` badge showing the count
  - On button click: toggle dropdown open; immediately call `PATCH /api/notifications` with `{ markAllRead: true }`; re-fetch `GET /api/notifications` to sync state
  - Dropdown lists each notification's `message` and formatted `created_at`; renders an empty-state message when the array is empty

---

### US-005 Testing Pyramid Addendum

| Layer                                   | Tasks | Task IDs         | Notes                                                                   |
| --------------------------------------- | ----- | ---------------- | ----------------------------------------------------------------------- |
| Unit — `src/__tests__/lib/`             | 0     | —                | No new pure-function lib code in US-005 scope                           |
| Integration — `src/__tests__/api/`      | 3     | T038, T039, T040 | In-memory SQLite; route handlers called directly; 10 test cases total   |
| Component — `src/__tests__/components/` | 1     | T041             | RTL; fetch stubbed via `vi.stubGlobal`; no DB; 3 test cases             |
| Helper — `src/__tests__/helpers/`       | 1     | T037             | Test utility consumed by T038–T040; not counted in pyramid distribution |

**Effective distribution for US-005**: 75% integration / 25% component. Justified: the story is API-centric (3 endpoints, 7 ACs); the component test covers the UI contract without duplicating integration coverage.

---

### US-005 Dependency Graph

```
Phase 2 helpers (T005–T010)
    └── T037    Helper — insertTestNotification (src/__tests__/helpers/notifications.ts)
            ├── T038 [P] Integration tests — GET /api/notifications (list.test.ts)
            ├── T039 [P] Integration tests — PATCH /api/notifications/[id] (mark-read.test.ts)
            └── T040 [P] Integration tests — PATCH /api/notifications bulk (bulk-read.test.ts)
T041 [P] Component tests — NotificationBell (can be written in parallel; stubs fetch)
T042 [P] Source — src/app/api/notifications/route.ts
T043 [P] Source — src/app/api/notifications/[id]/route.ts
T044    Source — src/components/notifications/NotificationBell.tsx
         (depends on T042 + T043: calls both endpoints at runtime)
```

**Parallel opportunities**:

- T038 + T039 + T040 in parallel — different test files; all require T037 first
- T041 + T042 + T043 in parallel — component test stubs fetch so does not require real handlers; source files are independent
- T044 only after T042 + T043 — component calls both route handlers at runtime

---

### US-005 Task Summary

| Metric                     | Count                                                  |
| -------------------------- | ------------------------------------------------------ |
| New tasks                  | 8 (T037–T044)                                          |
| Helper tasks               | 1 (T037)                                               |
| Test tasks                 | 4 (T038–T041)                                          |
| Source tasks               | 3 (T042–T044)                                          |
| Parallelizable `[P]` tasks | 5 (T038, T039, T040, T042, T043)                       |
| Total test cases           | 13 (4 list + 3 mark-read + 3 bulk + 3 component)       |
| ACs covered                | AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6 · AC-7 (all 7) |

---

### US-004 Testing Pyramid Addendum

| Layer                                   | Tasks | Task IDs | Notes                                                    |
| --------------------------------------- | ----- | -------- | -------------------------------------------------------- |
| Unit — `src/__tests__/lib/`             | 1     | T033     | Zod `evaluationSchema`; pure function, no DB             |
| Integration — `src/__tests__/api/`      | 1     | T034     | 7 cases; in-memory SQLite; route handler called directly |
| Component — `src/__tests__/components/` | 0     | —        | No new UI component in US-004 scope                      |

**Effective distribution for US-004**: 50% unit / 50% integration (single-route story with no new UI).

---

### US-004 Dependency Graph

```
Phase 2 helpers (T005–T010)
    └── Phase 7: US-004 Admin Evaluation
            ├── T033 [P] Unit tests — evaluationSchema (validations.test.ts)
            ├── T034 [P] Integration tests — POST /api/ideas/[id]/evaluate (evaluate.test.ts)
            ├── T035 [P] Source — add evaluationSchema to src/lib/validations.ts
            └── T036    Source — create src/app/api/ideas/[id]/evaluate/route.ts
                         (depends on T035: imports evaluationSchema)
```

**Parallel opportunities**:

- T033 + T034 in parallel — different test files, no shared write targets
- T035 + T033 + T034 in parallel — source schema extension is independent of test authoring
- T036 only after T035 — route handler imports `evaluationSchema` from `src/lib/validations.ts`

---

### US-004 Task Summary

| Metric                     | Count                                                         |
| -------------------------- | ------------------------------------------------------------- |
| New tasks                  | 4 (T033–T036)                                                 |
| Test tasks                 | 2 (T033, T034)                                                |
| Source tasks               | 2 (T035, T036)                                                |
| Parallelizable `[P]` tasks | 3 (T033, T034, T035)                                          |
| Total test cases           | 12 (5 unit + 7 integration)                                   |
| ACs covered                | AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6 · ADR-002 side effect |
