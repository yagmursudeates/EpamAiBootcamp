# Architecture Overview — Personal Task Board

Version: 1.0
Date: 2026-05-13
Source: specs/prds/prd-personal-task-board.md · agents.md

---

## System Architecture

### Pattern: Client-Side Monolith (SPA)

We use a single-page React application with no backend to support:

- Zero infrastructure overhead — runs in any browser in under 10 seconds
- Offline-first persistence — all state lives locally in `localStorage`
- Solo-user workflows — no need for auth, sync, or multi-user coordination

### Core Services

- **Board UI**: Renders three columns (To Do, In Progress, Done); handles drag-and-drop ordering and column moves; shows per-column task counts
- **Task UI**: Create/edit/delete task dialog; input validation (title required); visual feedback on save/error
- **Project UI**: Project selector dropdown; filter tasks by project; create new project board
- **State Layer**: Holds all board/task/project data in memory; initialised from `localStorage` on mount; single source of truth for the UI
- **Persistence Service**: Serialises/deserialises state to versioned JSON; catches `QuotaExceededError`; called on every state mutation
- **Keyboard Handler**: Global shortcut listener (Ctrl+N, Alt+→/←, Delete, Esc, ?); delegates to state layer actions
- **Help Overlay**: Accessible modal listing all shortcuts and basic usage; triggered by "?" key or button

### Communication

- **Synchronous (in-process)**: React component → state layer → persistence service (all in-browser, no network)
- **No asynchronous messaging**: No queues, no events across services — all actions resolve synchronously within a single render cycle

### Key Design Decisions

- **No backend, ever (for v1):** Eliminates auth, infra, and data-sync complexity. All data lives in `localStorage`. Users are advised not to store secrets in task descriptions.
- **No Redux / Zustand for MVP:** React context + `useReducer` is sufficient for ≤500 cards and 2–3 projects. Add a global store only if profiling shows re-render bottlenecks.
- **Drag-and-drop via library:** Use `@dnd-kit/core` rather than native HTML5 DnD for accessible keyboard-move support and mobile touch events.
- **Versioned JSON schema in localStorage:** A single versioned JSON blob per project key allows future migrations without data loss.

---

## Tech Stack

> This is a frontend-only application. There is no backend, no database, and no server. All entries below reflect that constraint.

### Backend

- **Language**: N/A — no server-side runtime
- **Framework**: N/A — no backend framework
- **Database**: N/A — persistence is handled entirely via browser `localStorage` (5–10 MB quota, JSON format)
- **ORM**: N/A

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite (sub-second HMR; fast production builds)
- **State Management**: React Context + `useReducer` (sufficient for ≤500 cards; no Redux/Zustand for MVP)
- **Drag & Drop**: `@dnd-kit/core` — accessible keyboard DnD, touch-friendly, tree-shakeable
- **Styling**: CSS Modules or Tailwind CSS (TBD; no runtime CSS-in-JS to keep bundle lean)
- **Testing**: Vitest + React Testing Library (≥80% coverage target for CRUD and board logic)
- **Accessibility Audit**: axe-core / Lighthouse (WCAG 2.1 AA; run in CI)
- **Linting / Formatting**: ESLint + Prettier (enforced via pre-commit hook or CI step)

### Infrastructure

- **Cloud Provider**: None required — static files only; optionally hosted on GitHub Pages, Netlify, or Vercel
- **Containers**: None — no server process to containerise
- **CI/CD**: GitHub Actions (lint → type-check → test → a11y audit → build → deploy `dist/`)

### localStorage Schema (draft)

```jsonc
// Key: "taskboard-projects"
{
  "version": 1,
  "activeProjectId": "proj-abc",
  "projects": [
    {
      "id": "proj-abc",
      "name": "My Project",
      "columns": ["todo", "inprogress", "done"],
      "tasks": [
        {
          "id": "task-001",
          "title": "Set up Vite",
          "description": "",
          "column": "done",
          "order": 0,
          "createdAt": "2026-05-05T10:00:00Z",
          "updatedAt": "2026-05-05T10:00:00Z",
        },
      ],
    },
  ],
}
```

---

## Deployment

> This is a static frontend — there is no server, no containers, and no database to migrate. Deployment means publishing the `dist/` folder to a static host.

### Environments

- **dev**: Local Vite dev server (`npm run dev` at `localhost:5173`); no deployment needed
- **preview**: Automatic deployment on merge to `main` (e.g., Netlify/Vercel preview URL) for quick verification
- **production**: Manual promotion from preview; served from GitHub Pages, Netlify, or Vercel static hosting

### CI/CD Pipeline

1. Code pushed to GitHub triggers workflow (GitHub Actions)
2. Lint (ESLint + Prettier check) and type-check (`tsc --noEmit`) run
3. Unit and integration tests run (Vitest)
4. Accessibility audit runs (Lighthouse CI or axe)
5. Production build generated (`vite build` → `dist/`)
6. Static `dist/` folder deployed to hosting provider
7. Smoke check: app URL responds and loads within < 2 s

### Strategy

- **Atomic deploy**: Static hosts (Netlify, Vercel, GitHub Pages) swap the entire `dist/` atomically — no partial states served to users
- **Rollback**: Revert to the previous deploy via hosting provider dashboard (one click; no downtime)
- **No blue-green needed**: No server process to drain; old static files are simply replaced atomically
- **No secrets in CI**: App has no API keys, tokens, or server credentials — pipeline is fully public-safe

### Browser Support

| Browser | Versions |
| ------- | -------- |
| Chrome  | Latest 2 |
| Firefox | Latest 2 |
| Safari  | Latest 2 |
| Edge    | Latest 2 |

`localStorage` is available in all supported browsers. No polyfills required.

---

## Success Metrics (Architecture Perspective)

| Metric                | Target           | How Architecture Supports It                           |
| --------------------- | ---------------- | ------------------------------------------------------ |
| App load < 2 s        | Lighthouse ≥ 90  | Vite tree-shaking; no server round-trips               |
| Task creation < 10 s  | UX timer         | Instant local state update; no network                 |
| Task move < 3 s       | UX timer         | In-memory DnD; synchronous localStorage write          |
| 100% data persistence | Manual test      | Every mutation writes to localStorage before returning |
| WCAG 2.1 AA           | axe / Lighthouse | Semantic HTML; ARIA labels; keyboard DnD library       |
| ≥80% test coverage    | Vitest report    | Core CRUD and persistence service fully unit-tested    |

---

## Related Files

- [agents.md](../../agents.md) — Tech stack constraints and spec conventions
- [specs/prds/prd-personal-task-board.md](../../specs/prds/prd-personal-task-board.md) — Full PRD with FRs and NFRs
- [conventions/coding-standards.md](../conventions/coding-standards.md) — Code style and patterns
- [domain/glossary.md](../domain/glossary.md) — Term definitions (Board, Column, Task, Project)
