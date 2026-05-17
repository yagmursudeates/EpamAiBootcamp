<!--
SYNC IMPACT REPORT
Version change: 1.3.0 → 1.4.0 (MINOR — §9 Tools & Frameworks added)
Modified sections: none
Added sections: §9 Tools & Frameworks (static analysis, unit/integration/E2E tooling, coverage/mutation tools, execution commands, pre-commit hook, CI/CD pipeline)
Removed sections: none
Total Testing Principles sections: 9 (§1–§9)
Templates updated:
  ✅ .specify/memory/constitution.md — updated (this file)
  ✅ CONSTITUTION.md (repo root) — updated in sync
  ⚠ .specify/templates/ — not present in this workspace; propagation skipped
Deferred TODOs: none
-->

# InnovatEPAM Portal Constitution

## Core Principles

### I. Clean Code (NON-NEGOTIABLE)

Every file, function, and component must be readable and self-explanatory.

- Functions do one thing; keep them short (target ≤ 30 lines)
- Names are intention-revealing: variables, functions, and components describe what they do
- No dead code, commented-out blocks, or TODO leftovers in merged code
- Consistent formatting enforced by ESLint + Prettier; CI fails on lint errors
- Co-locate related files; avoid "barrel" re-exports that obscure origins
- Prefer explicit over clever — no magic numbers, no implicit type coercions

### II. Simple and Responsive UI/UX

The interface must be immediately usable without training.

- Mobile-first layout using Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`)
- Tailwind utility classes only — no custom CSS files unless Tailwind cannot achieve the result
- Use shadcn/ui components as the default building block; do not reinvent form controls, dialogs, or buttons
- Every interactive element must have a visible focus state (keyboard accessible)
- Loading, empty, and error states are required for every data-fetching surface
- Forms provide inline validation feedback; never submit silently
- Color contrast must meet WCAG AA minimum

### III. Minimal Dependencies

Only add a dependency when it provides substantial, irreplaceable value.

- Evaluate every new package: Could this be done with 10 lines of native code?
- Prefer packages already in the tree over introducing a new one
- No packages that duplicate Next.js or React built-ins (e.g. no separate router, no class-based state managers)
- Permitted core dependencies: `next`, `react`, `react-dom`, `tailwindcss`, `shadcn/ui` (and its peer deps — including `sonner`, `react-hook-form`, `clsx`, `tailwind-merge`), `better-sqlite3`, `next-auth`, `bcryptjs`, `zod`, `date-fns`, `uuid`
- Any addition outside the permitted list requires a short justification comment in `package.json`

### IV. Next.js + React + Tailwind as the Canonical Stack

These choices are fixed and not subject to per-feature deviation.

- Framework: **Next.js 14+** App Router (server components by default; `"use client"` only when state or browser APIs are required)
- UI layer: **React 18+** functional components with hooks; no class components
- Styling: **Tailwind CSS v4** utility classes; `@theme` block in `src/app/globals.css` is the single source of design tokens (not `tailwind.config.ts`, which is not used in v4)
- Data: **SQLite** via `better-sqlite3`; all DB access goes through `src/lib/db/`
- Validation: **Zod** schemas at every API boundary
- Auth: **NextAuth.js** Credentials provider; sessions via JWT
- No CSS-in-JS libraries (styled-components, emotion, etc.)

### V. Spec-Driven Development (SDD) Workflow

Specifications precede code. Always.

- SpecKit artifacts (`CONSTITUTION.md`, `spec.md`, `plan.md`, `tasks.md`) are maintained in the repo root
- No feature work begins without an accepted `spec.md` entry and corresponding tasks in `tasks.md`
- Each phase starts with `/speckit.specify` scoped to that phase's `requirements.md`
- Commit messages follow the pattern: `type(scope): short description` (e.g. `feat(auth): add login page`)
- SpecKit artifacts are updated to reflect reality before the phase is considered complete

## Security Requirements

- Passwords stored as bcrypt hashes only; plaintext never logged or persisted
- All API routes validate input with Zod before touching the database
- File uploads: validate MIME type and size server-side; store in `uploads/` directory (project root, outside `public/`) excluded from git
- Role checks enforced in middleware (`middleware.ts`) and repeated in each API route handler
- No secrets in source code; use `.env.local` (gitignored)
- `.github/` added to `.gitignore` to prevent accidental credential leakage (per SpecKit recommendation)

## Testing Principles

### 1. Testing Philosophy

Test-Driven Development (TDD) is the default workflow — not an option.

- Follow the **RED → GREEN → REFACTOR** cycle: write a failing test first, make it pass with the minimum code required, then clean up
- Tests are derived from **specifications** (user stories, acceptance criteria, ADRs) — never reverse-engineered from implementation
- A feature is not started until its test scaffold exists; it is not done until all tests pass
- Test code is production code: it MUST meet the same Clean Code standards (Principle I)

### 2. Coverage Requirements

The Testing Pyramid governs layer distribution.

- **~70% unit tests**: Pure functions in `src/lib/` — Zod schemas, validation logic, utilities, formatters
- **~20% integration tests**: API route handlers in `src/app/api/` called directly (no HTTP); database operations using an in-memory SQLite instance
- **~10% E2E tests**: Critical user workflows only — deferred to Playwright; in-scope from Phase 2 per ADR-001
- **Static analysis**: TypeScript strict mode + ESLint; CI fails on type errors or lint violations
- **Coverage targets**: ≥ 80% line coverage, ≥ 75% branch coverage, ≥ 75% mutation score
- Coverage is enforced in CI (`npm run test:ci`); PRs below threshold MUST NOT be merged

### 3. Test Types & Organization

Each test type has a designated location; directory structure mirrors the source tree.

- **Unit tests**: `src/__tests__/lib/**/*.test.ts` — mirrors `src/lib/`; covers Zod schemas, utilities, formatters, and pure business logic
- **Integration tests**: `src/__tests__/api/**/*.test.ts` — grouped by API route/feature; calls route handlers directly without HTTP
- **Component tests**: `src/__tests__/components/**/*.test.tsx` — grouped by component; tests rendering, interactions, and conditional state
- **E2E tests**: `e2e/**/*.spec.ts` — grouped by user journey; deferred to Playwright per ADR-001
- One test file per source file for unit and component tests; do not mix test types in the same file
- Global test setup lives in `src/__tests__/setup.ts` (referenced by `vitest.config.ts`)

### 4. Naming Conventions

File names and test descriptions are the public API of the test suite — keep them precise.

- **Test files**: `ComponentName.test.tsx` for React components; `module-name.test.ts` for `lib/` and `api/` modules
- **E2E files**: `user-journey-name.spec.ts` (e.g. `registration-login.spec.ts`, `idea-submission.spec.ts`)
- **Test suites**: `describe('ComponentName', ...)` for components; `describe('POST /api/ideas', ...)` for API routes
- **Test cases**: `it('should [outcome] when [condition]', ...)` — readable as a sentence without surrounding context
- Prefer Given/When/Then phrasing in `it()` strings for behaviour-critical paths (auth, submission, evaluation)

### 5. Test Anatomy

Every test follows Arrange-Act-Assert (AAA) — no exceptions.

- **Arrange**: Set up data, mocks, and preconditions in `beforeEach` (NOT `beforeAll`); per-test setup prevents cross-test contamination
- **Act**: Execute exactly one operation — call one function, fire one event, or make one API call
- **Assert**: Verify the outcome; one logical concept per assertion; do not combine unrelated `expect` calls in a single test
- Each test MUST be independent — it MUST pass when run in isolation and in any order
- No shared mutable global state; reset all mocks in `afterEach` via `vi.clearAllMocks()` or `vi.restoreAllMocks()`

### 6. Mocking & Test Data

Use the right double for the right job; never mock what you own.

- **Mock** (verify interactions): `nodemailer` transport via `setTransport()` (ADR-003); NextAuth session; future third-party API clients
- **Stub** (control return values): `Date.now()` and timer functions via `vi.useFakeTimers()` / `vi.setSystemTime()`; `crypto.randomUUID()` via `vi.spyOn()`
- **Fake** (lightweight replacement): in-memory SQLite (`:memory:`) per suite — schema applied fresh, torn down after each suite
- **Do NOT mock**: Zod schemas, `src/lib/utils.ts`, `src/lib/validations.ts`, or any code you own — test those directly
- **Fixtures**: Define typed fixture constants in `src/__tests__/fixtures/` (e.g. `users.ts`, `ideas.ts`); shape MUST mirror `src/lib/db/seed.ts`
- **Helpers**: Extract setup repetition into named helpers (e.g. `createTestUser()`, `insertTestIdea()`) in `src/__tests__/helpers/`; never copy-paste fixture setup across test files

### 7. Quality Criteria

A test that cannot catch a real bug provides false confidence — it is worse than no test.

**What makes a good test:**
- Tests **observable behaviour**, not implementation details — no assertions on private methods or internal state
- Has **meaningful assertions** — not tautological (`expect(result).toBe(result)`) and not trivially always-true
- Tests **one thing** — a single behaviour per `it()`; use multiple tests for multiple scenarios
- Is **fast**: unit tests < 1 s, integration tests < 5 s; tests exceeding these thresholds MUST be investigated
- Is **deterministic**: same inputs always produce the same outputs; no dependency on execution order, wall-clock time, or network

**Quality gates (enforced in CI):**
- **Mutation score ≥ 75%** via Stryker (`@stryker-mutator/vitest-runner`); run with `npx stryker run`
- **No tautological assertions**: code review MUST flag `expect(x).toBe(x)` and `expect(true).toBe(true)` patterns
- **Human-validated oracles**: all expected values in assertions MUST be derived from the specification (story AC or ADR), never copied from the implementation output
- **Line coverage ≥ 80%, branch coverage ≥ 75%** enforced via `coverage.thresholds` in `vitest.config.ts`

**Anti-patterns (fail code review):**
- Testing private methods or internal implementation state
- Interdependent tests — suites that require a specific execution order to pass
- Brittle tests — tests that break on safe refactoring with no behaviour change
- Flaky tests — any intermittent failure; treat as a P1 bug, fix or delete immediately
- Tests without assertions (`it()` blocks with no `expect` call)
- Copy-pasted test setup — extract into helpers in `src/__tests__/helpers/`

### 8. CI/CD Integration

The test suite is the merge gate.

- `npm run test:ci` runs Vitest in single-pass mode (`vitest run`) with coverage; MUST exit 0 before a PR is mergeable
- `npm run lint` and `npm run build` run before `test:ci` in the CI pipeline; a broken build blocks merge before tests even run
- Coverage reports are generated to `coverage/` (gitignored); coverage summary is printed to CI logs
- Flaky tests are bugs: a test that fails intermittently MUST be fixed or deleted, never retried silently

### 9. Tools & Frameworks

All tooling choices are locked for the project; changes require a constitution amendment.

**Static analysis:**
- **TypeScript** strict mode (`"strict": true` in `tsconfig.json`) — CI fails on type errors
- **ESLint** with `eslint-config-next` — CI fails on lint violations
- **Prettier** for formatting (enforced via ESLint plugin)

**Unit & integration testing:**
- **Framework**: Vitest (v2+) — native ESM, Vite-compatible, no config overhead
- **Assertion**: Vitest built-in `expect` (Chai-compatible API)
- **Mocking**: Vitest built-in `vi` (replaces Jest's `jest` object)
- **Component testing**: React Testing Library (`@testing-library/react`) + `@testing-library/user-event`
- **Test environment**: `jsdom` (configured in `vitest.config.ts`)

**E2E testing:**
- **Framework**: Playwright — deferred to Phase 2 per ADR-001
- Optional: Stagehand for AI-native browser automation (evaluate at Phase 2 start)

**Coverage & quality:**
- **Coverage tool**: `@vitest/coverage-v8` — 80% line, 75% branch (enforced via `coverage.thresholds` in `vitest.config.ts`)
- **Mutation testing**: Stryker `@stryker-mutator/vitest-runner` — ≥ 75% mutation score

**Execution commands (npm):**

| Purpose | Command |
|---|---|
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Run all tests + coverage | `npm run test:ci` |
| Run unit tests only | `npx vitest run src/__tests__/lib` |
| Run integration tests only | `npx vitest run src/__tests__/api` |
| Run E2E tests | `npx playwright test` *(Phase 2+)* |
| Generate coverage report | `npx vitest run --coverage` |
| Run mutation testing | `npx stryker run` |

**Pre-commit hook**: `tsc --noEmit` → `npm run lint` → `npx vitest run src/__tests__/lib`

**CI/CD pipeline (main branch)**: type-check → lint → build → `npm run test:ci` (all tests + coverage) → `npx stryker run` (mutation gate)

## Development Workflow

- Branch off `main` for each phase; merge via PR after manual acceptance criteria walkthrough
- Run `npm run lint` and `npm run build` before every commit; broken builds are not merged
- Seed data (`src/lib/db/seed.ts`) provides 1 admin + 2 submitter accounts for local development
- `uploads/` (at project root, outside `public/`) is gitignored; document setup steps in `README.md`
- `PROJECT_SUMMARY.md` updated at the end of each completed phase

## Governance

This Constitution supersedes any conflicting pattern, library default, or AI-generated suggestion.
Amendments require an update to this file with a rationale note and version bump.
All pull requests are reviewed against these principles before merge.
When requirements conflict with mockups, **requirements are authoritative**.

**Version**: 1.4.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-17
