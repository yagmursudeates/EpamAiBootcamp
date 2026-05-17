# InnovatEPAM Portal — Test Tasks

> **Feature**: InnovatEPAM Portal (US-001 · US-002 · US-003)
> **Generated**: 2026-05-17
> **Approach**: TDD — tests are written before implementation (Constitution §1)
> **Framework**: Vitest v2+ / React Testing Library / Stryker (`@stryker-mutator/vitest-runner`)
> **Available docs**: us1-registration-login.md · us2-idea-submission.md · us3-idea-listing-status.md · ADR-001 · ADR-002 · ADR-003 · CONSTITUTION.md v1.4.0

---

## Phase 1: Test Infrastructure Setup

**Goal**: Establish the test harness before any story work begins. Every subsequent phase depends on this phase being complete.

- [X] T001 Create `vitest.config.ts` at project root — set environment `jsdom`, setupFiles `src/__tests__/setup.ts`, coverage provider `v8`, and `coverage.thresholds` (lines: 80, branches: 75, functions: 80)
- [X] T002 Create global test setup file `src/__tests__/setup.ts` — import `@testing-library/jest-dom`; add `vi.mock('next-auth')` with a default export returning `null` session
- [X] T003 Create `stryker.config.ts` at project root — set `vitest` runner, mutate `['src/lib/**/*.ts', 'src/app/api/**/*.ts']`, `thresholds.high: 75`, `thresholds.break: 60`
- [X] T004 Add npm scripts to `package.json`: `"test": "vitest"`, `"test:ci": "vitest run --coverage"`, `"test:unit": "vitest run src/__tests__/lib"`, `"test:integration": "vitest run src/__tests__/api"`, `"coverage": "vitest run --coverage"`, `"mutation": "npx stryker run"`

---

## Phase 2: Foundational Test Utilities

**Goal**: Shared helpers and typed fixtures consumed by all story phases. MUST be fully complete before starting Phase 3.

- [X] T005 Create `src/__tests__/helpers/db.ts` — export `createTestDb(): Database` (opens `:memory:` SQLite, applies full schema from `src/lib/db/schema.ts`) and `closeTestDb(db: Database): void`; each test suite calls `createTestDb()` in `beforeEach` and `closeTestDb()` in `afterEach`
- [X] T006 [P] Create `src/__tests__/helpers/auth.ts` — export `mockSession(overrides?: Partial<Session>): Session` returning a NextAuth session object with role `submitter` by default; used by `vi.mocked(getServerSession).mockResolvedValue(mockSession())`
- [X] T007 [P] Create `src/__tests__/fixtures/users.ts` — export typed constants `SUBMITTER_USER` and `ADMIN_USER`; all fields must match the `users` table schema (`id`, `name`, `email`, `password_hash`, `role`, `created_at`)
- [X] T008 [P] Create `src/__tests__/fixtures/ideas.ts` — export typed constants `SUBMITTED_IDEA`, `ACCEPTED_IDEA`, `REJECTED_IDEA`; fields match `ideas` table schema (`id`, `title`, `description`, `category`, `status`, `submitter_id`, `is_anonymous`, `created_at`, `updated_at`)
- [X] T009 [P] Create `src/__tests__/helpers/users.ts` — export `createTestUser(db: Database, overrides?: Partial<User>): User` that inserts a bcrypt-hashed user row using `SUBMITTER_USER` as base and returns the inserted record
- [X] T010 [P] Create `src/__tests__/helpers/ideas.ts` — export `insertTestIdea(db: Database, submitterId: string, overrides?: Partial<Idea>): Idea` that inserts an idea row using `SUBMITTED_IDEA` as base and returns the record

---

## Phase 3: US-001 — Employee Registration & Login

**Story goal**: Secure registration and role-based login for EPAM employees.

**Independent test criteria**: All AC-1 through AC-6 pass when running `npx vitest run src/__tests__/lib src/__tests__/api/auth src/__tests__/components/auth`

- [X] T011 [P] [US1] Write unit tests for Zod registration schema in `src/__tests__/lib/validations.test.ts` — `describe('registrationSchema')`:
  - `should accept valid name, email, and password ≥ 8 chars` (AC-1)
  - `should reject password shorter than 8 characters` (AC-1 min length)
  - `should reject missing name field` (AC-1 required)
  - `should reject malformed email address` (AC-1 email format)

- [X] T012 [P] [US1] Write unit tests for password hashing utility in `src/__tests__/lib/auth-utils.test.ts` — `describe('hashPassword')` and `describe('verifyPassword')`:
  - `should return a string that differs from the plaintext input`
  - `should return true when correct password is verified against its hash`
  - `should return false when incorrect password is verified against a hash`

- [X] T013 [US1] Write integration tests for `POST /api/auth/register` in `src/__tests__/api/auth/register.test.ts`:
  - `should return 201 and insert user with role submitter for a valid payload` (AC-1)
  - `should return 409 when email already exists in the database` (AC-2)
  - `should return 422 when Zod validation fails on the request body` (AC-1 guard)
  - Setup: `createTestDb()` in `beforeEach`; import route handler directly (no HTTP)

- [X] T014 [US1] Write integration tests for NextAuth credentials provider in `src/__tests__/api/auth/credentials.test.ts`:
  - `should return a user object with role submitter for valid submitter credentials` (AC-3)
  - `should return a user object with role admin for valid admin credentials` (AC-3)
  - `should return null when password does not match the stored hash` (AC-4)
  - `should return null when email is not registered` (AC-4)
  - Setup: `createTestDb()`; use `createTestUser()` and `ADMIN_USER` fixture

- [X] T015 [US1] Write component tests for `RegisterForm` in `src/__tests__/components/auth/RegisterForm.test.tsx`:
  - `should display inline error "Email already in use" when API responds with 409` (AC-2)
  - `should display validation error when password field has fewer than 8 characters` (AC-1)
  - `should call router.push("/dashboard") on successful 201 response` (AC-1)
  - Setup: `mockSession()` with `null` (unauthenticated); stub `fetch` with `vi.stubGlobal`

- [X] T016 [US1] Write component tests for `LoginForm` in `src/__tests__/components/auth/LoginForm.test.tsx`:
  - `should display "Invalid email or password" when signIn returns an error` (AC-4)
  - `should not navigate away from /login when credentials are incorrect` (AC-4)
  - Setup: mock `next-auth/react` `signIn` via `vi.mock`

- [X] T017 [US1] Write integration tests for auth middleware in `src/__tests__/api/auth/middleware.test.ts`:
  - `should redirect unauthenticated request for /dashboard to /login` (AC-6)
  - `should pass through an authenticated request for /dashboard without redirect` (AC-6 inverse)
  - Setup: stub `auth()` from `next-auth` to return `null` (unauthenticated) and a valid session (authenticated)

---

## Phase 4: US-002 — Idea Submission

**Story goal**: Logged-in submitters can create ideas with optional file attachments.

**Independent test criteria**: All AC-1 through AC-5 pass when running `npx vitest run src/__tests__/lib src/__tests__/api/ideas src/__tests__/components/ideas`

**Dependency**: Phase 2 helpers (`createTestUser`, `mockSession`, fixtures)

- [X] T018 [P] [US2] Extend unit tests in `src/__tests__/lib/validations.test.ts` — add `describe('ideaSchema')`:
  - `should accept valid title, description, and one of the five defined categories` (AC-1)
  - `should reject blank title` (AC-3)
  - `should reject blank description` (AC-3)
  - `should reject title longer than 100 characters` (AC-1 edge)
  - `should reject description longer than 2000 characters` (AC-1 edge)
  - `should reject a category value not in the defined enum` (AC-5)

- [X] T019 [P] [US2] Write unit tests for file attachment validation in `src/__tests__/lib/attachments.test.ts` — `describe('validateAttachment')`:
  - `should accept PDF, DOCX, PPTX, XLSX, PNG, JPG, JPEG, GIF, and MP4 MIME types` (AC-2)
  - `should reject a MIME type not in the allowlist` (AC-2 security)
  - `should accept a file whose size is exactly 10 MB` (AC-2 boundary)
  - `should reject a file whose size exceeds 10 MB` (AC-4)

- [X] T020 [US2] Write integration tests for `POST /api/ideas` (text-only payload) in `src/__tests__/api/ideas/create.test.ts`:
  - `should return 201 and create idea with status submitted for a valid payload` (AC-1)
  - `should return 422 when title is blank` (AC-3)
  - `should return 422 when description is blank` (AC-3)
  - `should return 422 when category is not one of the five allowed values` (AC-5)
  - `should return 401 when request is unauthenticated` (auth guard)
  - Setup: `createTestDb()`, `createTestUser()`, `mockSession()`; call route handler directly

- [X] T021 [US2] Extend `src/__tests__/api/ideas/create.test.ts` — add `describe('POST /api/ideas — file attachment')`:
  - `should store file metadata in the attachments table when a valid file is attached` (AC-2)
  - `should return 422 and not create an idea record when attached file exceeds 10 MB` (AC-4)
  - `should return 422 when attached file MIME type is not in the allowlist` (AC-2 security)
  - Stub `fs.writeFile` via `vi.spyOn(fs.promises, 'writeFile').mockResolvedValue()`; verify it is NOT called on rejection

- [X] T022 [US2] Write component tests for `IdeaSubmissionForm` in `src/__tests__/components/ideas/IdeaSubmissionForm.test.tsx`:
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

- [X] T023 [P] [US3] Write integration tests for `GET /api/ideas` in `src/__tests__/api/ideas/list.test.ts`:
  - `should return only ideas whose submitter_id matches the authenticated user` (AC-1)
  - `should not return ideas belonging to a different user` (AC-1 isolation)
  - `should return an empty array when the authenticated user has no ideas` (AC-2)
  - Setup: `createTestDb()`; insert two users with `createTestUser()`; insert ideas with `insertTestIdea()`; `mockSession()` scoped to one user

- [X] T024 [P] [US3] Write integration tests for `GET /api/ideas/[id]` in `src/__tests__/api/ideas/detail.test.ts`:
  - `should return the full idea detail with evaluations joined for the idea's owner` (AC-3)
  - `should return 403 when an authenticated user requests an idea they do not own` (security — US-003 technical notes)
  - `should return 404 for a non-existent idea id` (edge)
  - Setup: `createTestDb()`; two users; `insertTestIdea()`; `mockSession()` toggled between users

- [X] T025 [P] [US3] Write component tests for `StatusBadge` in `src/__tests__/components/ideas/StatusBadge.test.tsx`:
  - `should render with a green colour indicator when status prop is "accepted"` (AC-4)
  - `should render with a red colour indicator when status prop is "rejected"` (AC-5)
  - `should render with a neutral colour indicator when status prop is "submitted"`

- [X] T026 [P] [US3] Write component tests for `IdeaCard` in `src/__tests__/components/ideas/IdeaCard.test.tsx`:
  - `should render title, category, submission date, and a StatusBadge` (AC-1)
  - `should pass the correct status value to StatusBadge` (AC-1)
  - Uses `SUBMITTED_IDEA` fixture

- [X] T027 [US3] Write component tests for `Dashboard` page in `src/__tests__/components/dashboard/Dashboard.test.tsx`:
  - `should render one IdeaCard per idea returned by GET /api/ideas` (AC-1)
  - `should render the empty state with a "Submit your first idea" link when the API returns an empty array` (AC-2)
  - Setup: `mockSession()` (authenticated submitter); stub `fetch` for `GET /api/ideas` via `vi.stubGlobal`

- [X] T028 [US3] Write component tests for `IdeaDetailPage` in `src/__tests__/components/ideas/IdeaDetailPage.test.tsx`:
  - `should render title, description, category, status, submission date, and file attachment link` (AC-3)
  - `should display the evaluation notes section when status is "accepted"` (AC-4)
  - `should display the evaluation notes section when status is "rejected"` (AC-5)
  - `should hide the evaluation notes section when status is "submitted"` (AC-4/5 inverse)
  - Uses `ACCEPTED_IDEA`, `REJECTED_IDEA`, `SUBMITTED_IDEA` fixtures; `mockSession()`

---

## Phase 6: Quality Gates & Polish

**Goal**: Confirm the suite satisfies the constitution's coverage and mutation thresholds before any PR is raised.

- [X] T029 Run `npm run test:ci` and verify exit code is 0; confirm coverage summary shows line ≥ 80% and branch ≥ 75% (Constitution §2, §7)
- [X] T030 [P] Run `npx stryker run` against `src/lib/` and verify mutation score ≥ 75%; identify and fix any under-tested branches until threshold is met (Constitution §7 quality gate)
- [X] T031 [P] Audit every `it()` block across `src/__tests__/` for missing `expect` calls and for tautological assertions (`expect(x).toBe(x)`, `expect(true).toBe(true)`); fix or delete any violations (Constitution §7 anti-patterns)
- [X] T032 Verify pre-commit hook runs `npx tsc --noEmit` → `npm run lint` → `npx vitest run src/__tests__/lib` in sequence with non-zero exit on failure (Constitution §9 pre-commit hook)

---

## Testing Pyramid Analysis

**Scope**: test-writing tasks T011–T028 (18 tasks). Infrastructure T001–T010 and quality-gate T029–T032 excluded from distribution count.

| Layer | Tasks | Task IDs | % of test tasks | Target | Status |
|---|---|---|---|---|---|
| Unit — `src/__tests__/lib/` | 4 | T011, T012, T018, T019 | 22% | ~70% | ⚠ low (pure-function lib is small for 3 stories) |
| Component — `src/__tests__/components/` | 7 | T015, T016, T022, T025–T028 | 39% | — | ✅ RTL; no DB, no HTTP; counts as unit-level |
| Integration — `src/__tests__/api/` | 7 | T013, T014, T017, T020, T021, T023, T024 | 39% | ~20% | ⚠ above target; justified below |
| E2E — `e2e/` | 0 | — | 0% | ~10% | ℹ deferred to Phase 2 per ADR-001 |

**Effective pyramid** (component tests counted at unit level, E2E slot unavailable):
- Unit + Component: 11 / 18 = **61%** (target after E2E deferral: ~78%)
- Integration: 7 / 18 = **39%** (target: ~22%)

**Why integration is above target**: All 3 stories are API-heavy (auth routes, idea CRUD, access control). The 10% E2E slot is also empty (deferred), so more weight falls on integration. This is expected for Phase 1; it will self-correct once E2E tests are added in Phase 2.

---

## Testing Pyramid View

Tasks grouped by layer (same tasks as Phases 3–5; alternate view for pyramid compliance checking).

### UNIT TESTS — `src/__tests__/lib/` (4 tasks · 22%)
*Pure functions only: Zod schemas, utilities, validators. No DB, no HTTP, no rendering.*

- [X] T011 [P] [US1] Unit: Zod registration schema → `src/__tests__/lib/validations.test.ts`
- [X] T012 [P] [US1] Unit: Password hash/verify utility → `src/__tests__/lib/auth-utils.test.ts`
- [X] T018 [P] [US2] Unit: Zod idea schema → `src/__tests__/lib/validations.test.ts`
- [X] T019 [P] [US2] Unit: File attachment MIME + size validation → `src/__tests__/lib/attachments.test.ts`

### COMPONENT TESTS — `src/__tests__/components/` (7 tasks · 39%)
*RTL render + interaction tests. No DB, no HTTP; counts at unit level in the pyramid.*

- [X] T015 [US1] Component: `RegisterForm` → `src/__tests__/components/auth/RegisterForm.test.tsx`
- [X] T016 [US1] Component: `LoginForm` → `src/__tests__/components/auth/LoginForm.test.tsx`
- [X] T022 [US2] Component: `IdeaSubmissionForm` → `src/__tests__/components/ideas/IdeaSubmissionForm.test.tsx`
- [X] T025 [P] [US3] Component: `StatusBadge` → `src/__tests__/components/ideas/StatusBadge.test.tsx`
- [X] T026 [P] [US3] Component: `IdeaCard` → `src/__tests__/components/ideas/IdeaCard.test.tsx`
- [X] T027 [US3] Component: `Dashboard` → `src/__tests__/components/dashboard/Dashboard.test.tsx`
- [X] T028 [US3] Component: `IdeaDetailPage` → `src/__tests__/components/ideas/IdeaDetailPage.test.tsx`

### INTEGRATION TESTS — `src/__tests__/api/` (7 tasks · 39%)
*Route handlers called directly (no HTTP). In-memory SQLite via `createTestDb()`. NextAuth mocked.*

- [X] T013 [US1] Integration: `POST /api/auth/register` → `src/__tests__/api/auth/register.test.ts`
- [X] T014 [US1] Integration: NextAuth credentials provider → `src/__tests__/api/auth/credentials.test.ts`
- [X] T017 [US1] Integration: Auth middleware redirect → `src/__tests__/api/auth/middleware.test.ts`
- [X] T020 [US2] Integration: `POST /api/ideas` (text payload) → `src/__tests__/api/ideas/create.test.ts`
- [X] T021 [US2] Integration: `POST /api/ideas` (file attachment) → `src/__tests__/api/ideas/create.test.ts`
- [X] T023 [P] [US3] Integration: `GET /api/ideas` → `src/__tests__/api/ideas/list.test.ts`
- [X] T024 [P] [US3] Integration: `GET /api/ideas/[id]` → `src/__tests__/api/ideas/detail.test.ts`

### E2E TESTS — `e2e/` (0 tasks · 0% — deferred to Phase 2 per ADR-001)
*Playwright; planned for Phase 2. Placeholder file names for future reference:*

- `e2e/registration-login.spec.ts` — registration + role-based redirect flow *(Phase 2)*
- `e2e/idea-submission.spec.ts` — submit idea with file attachment flow *(Phase 2)*
- `e2e/idea-listing.spec.ts` — dashboard list + detail + status badge flow *(Phase 2)*

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

| Metric | Count |
|---|---|
| Total tasks | 32 |
| Phase 1 — Setup | 4 (T001–T004) |
| Phase 2 — Foundations | 6 (T005–T010) |
| Phase 3 — US-001 Auth | 7 (T011–T017) |
| Phase 4 — US-002 Submission | 5 (T018–T022) |
| Phase 5 — US-003 Listing | 6 (T023–T028) |
| Phase 6 — Quality Gates | 4 (T029–T032) |
| Parallelizable `[P]` tasks | 16 |
| User stories with independent test criteria | 3 |
| MVP scope | Phase 1–3 (T001–T017, 17 tasks) |
