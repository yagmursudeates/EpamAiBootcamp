# Development Workflow: Personal Task Board

Version: 1.0
Date: 2026-05-13
Source: agents.md · specs/prds/prd-personal-task-board.md

---

## 1. Development Process: Idea to Production

```
Story defined in specs/stories/
        │
        ▼
Branch created from main
        │
        ▼
Implementation (component + service + tests)
        │
        ▼
Self-review against Definition of Done
        │
        ▼
Pull Request opened → Code review
        │
        ▼
CI checks pass (lint, type-check, tests, a11y, build)
        │
        ▼
Merge to main → Auto-deploy to production (static host)
```

### Step-by-Step

1. **Read the story** — open `specs/stories/STORY-<id>.md`; understand acceptance criteria before writing any code.
2. **Read relevant memory bank files** — check `architecture/overview.md`, `conventions/coding-standards.md`, and `domain/glossary.md` for context.
3. **Create a feature branch** — see Branching Strategy below.
4. **Implement** — write component(s), hook(s), or service(s) following `conventions/coding-standards.md`. Co-locate tests.
5. **Run checks locally** — `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`.
6. **Open a PR** — reference the story ID in the PR title. Fill in the PR checklist.
7. **Review and merge** — address review comments; CI must be green before merge.
8. **Verify in production** — confirm the deployed app reflects the change; smoke-test the affected flow.

---

## 2. Branching Strategy: GitHub Flow

We use **GitHub Flow** — a simple, trunk-based strategy appropriate for a solo or small-team lab prototype with continuous delivery to a static host.

### Rules

| Branch                            | Purpose                                             | Created from | Merges into   |
| --------------------------------- | --------------------------------------------------- | ------------ | ------------- |
| `main`                            | Production-ready code; auto-deployed on every merge | —            | —             |
| `feature/<story-id>-<short-desc>` | New feature or story implementation                 | `main`       | `main` via PR |
| `fix/<short-desc>`                | Bug fix                                             | `main`       | `main` via PR |
| `chore/<short-desc>`              | Non-feature work (dependency updates, config, docs) | `main`       | `main` via PR |

### Branch Naming Examples

```
feature/story-core-task-01-create-task
feature/story-board-org-02-drag-drop
fix/task-dialog-focus-trap
chore/update-vite-5
```

### Rules

- **Never commit directly to `main`** — all changes go through a PR.
- **Short-lived branches** — aim to merge within 1–2 days to minimise drift.
- **One story per branch** — do not bundle multiple stories in a single branch.
- **Delete the branch** after merging.

---

## 3. Pull Request Process

### PR Title Format

```
[STORY-<id>] <imperative verb> <brief description>

Examples:
[STORY-core-task-01] Add task creation dialog with validation
[STORY-board-org-02] Implement drag-and-drop between columns
[fix] Restore focus to board after task dialog closes
```

### PR Description Template

```markdown
## Story

Link: specs/stories/STORY-<id>.md

## Changes

- [what was changed and why]

## Testing

- [ ] Unit tests added/updated
- [ ] Manually tested happy path
- [ ] Manually tested keyboard navigation
- [ ] localStorage persistence verified across reload

## Screenshots (if UI change)

[paste before/after screenshots]
```

### Code Review Checklist

Reviewers verify:

- [ ] Names follow conventions (`coding-standards.md` naming table)
- [ ] No business logic inside React components — mutations in reducer or service
- [ ] No hardcoded strings that belong in constants
- [ ] `localStorage` errors handled via `Result<T>` pattern; user sees actionable message
- [ ] Tests cover happy path and at least one error/edge case
- [ ] No commented-out code or stray `console.log` statements
- [ ] ARIA roles, labels, and focus management correct for any new interactive elements
- [ ] Acceptance criteria from the linked story are demonstrably met
- [ ] Spec files (if changed) follow `agents.md` naming and include Version/Author/Date

### Review Turnaround

- Aim to review PRs within **1 business day**.
- If a PR has been open for 2+ days with no review, ping the reviewer.
- Minor nits (style, wording) should be marked `nit:` and are non-blocking.

---

## 4. Testing Strategy

### Test Pyramid

```
          /\
         /E2E\        ← Not required for MVP
        /──────\
       /Integr. \     ← React Testing Library: key user flows per component
      /────────────\
     /  Unit Tests  \ ← Vitest: all services, utils, and reducers
    /────────────────\
```

### Coverage Requirements

| Layer                 | Target                                     | Measured by            |
| --------------------- | ------------------------------------------ | ---------------------- |
| `services/`           | ≥ 80%                                      | Vitest coverage report |
| `utils/`              | ≥ 80%                                      | Vitest coverage report |
| `context/` (reducers) | ≥ 80%                                      | Vitest coverage report |
| `components/`         | Key flows (create, move, delete, validate) | React Testing Library  |

### What to Test per Story

| Story type       | Required tests                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------- |
| New feature      | Happy path unit test + at least one error/edge case + integration test for user-visible flow |
| Bug fix          | Regression test that reproduces the bug before the fix                                       |
| Refactor         | Existing tests must still pass; no new tests required unless behaviour changed               |
| A11y improvement | axe-core assertion in the relevant component test                                            |

### Running Tests Locally

```bash
npm run test              # run all tests (watch mode)
npm run test:run          # single run (CI mode)
npm run test:coverage     # generate coverage report
npm run lint              # ESLint + Prettier check
npm run type-check        # tsc --noEmit
```

### localStorage Testing Pattern

Always stub `localStorage` — never rely on the real browser API in unit tests:

```typescript
const mockStorage: Record<string, string> = {};
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
    clear: () => {
      Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    },
  });
});
```

---

## 5. Deployment Process

### How Deployment Works

This is a **static frontend** — deployment means publishing the `dist/` folder to a static host. There is no server, no database migration, and no downtime.

```
Merge to main
      │
      ▼
GitHub Actions CI runs:
  1. npm run lint
  2. npm run type-check
  3. npm run test:run
  4. Lighthouse CI / axe audit
  5. npm run build  →  dist/
      │
      ▼
Deploy dist/ to static host (GitHub Pages / Netlify / Vercel)
      │
      ▼
Smoke check: open app URL, verify loads < 2 s, create a test task
```

### Environments

| Environment    | Trigger                            | URL                                      |
| -------------- | ---------------------------------- | ---------------------------------------- |
| **Local dev**  | `npm run dev`                      | `localhost:5173`                         |
| **Preview**    | PR opened / push to feature branch | Netlify/Vercel preview URL               |
| **Production** | Merge to `main`                    | GitHub Pages / Netlify / Vercel live URL |

### Smoke Check After Deploy

1. Open the production URL.
2. Verify the app loads in < 2 s.
3. Create a new task — confirm it appears in "To Do".
4. Reload the page — confirm the task persists.
5. Move the task via drag-and-drop — confirm column update persists.
6. Open the Help overlay (`?` key) — confirm it renders and closes.

### Rollback Procedure

Because the host serves static files atomically, rollback is instant:

**Netlify / Vercel:**

1. Open the hosting dashboard → Deployments list.
2. Click the previous successful deployment.
3. Click **"Publish deploy"** (Netlify) or **"Promote to Production"** (Vercel).
4. Verify the previous version is live.

**GitHub Pages:**

1. `git revert <merge-commit-sha>` on `main`.
2. Push the revert commit — CI will rebuild and redeploy automatically.

> No blue-green setup or health check required — static hosts swap files atomically with zero downtime.

---

## 6. AI Assistant Guidance

When implementing a story, follow this order:

1. Read `specs/stories/STORY-<id>.md` — understand acceptance criteria.
2. Read `memory-banks/domain/glossary.md` — confirm domain term usage.
3. Read `memory-banks/conventions/coding-standards.md` — apply naming and patterns.
4. Read `memory-banks/architecture/overview.md` — place new code in the correct layer.
5. Write the service/utility function first (testable in isolation), then the component.
6. Write tests alongside the implementation, not after.
7. Run `npm run lint && npm run type-check && npm run test:run` before opening a PR.
8. Never introduce a backend, server calls, or external API — `localStorage` only.

---

## Related Files

- [agents.md](../../agents.md) — Spec conventions, naming rules, tech stack
- [architecture/overview.md](../architecture/overview.md) — System design and CI/CD pipeline detail
- [conventions/coding-standards.md](../conventions/coding-standards.md) — Definition of Done and code review checklist
- [domain/glossary.md](../domain/glossary.md) — Term definitions
