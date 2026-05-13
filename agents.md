# AGENTS.md — Project Conventions

This file defines the conventions for the **course_project** repository.
AI assistants and contributors must follow these conventions when reading, writing, or modifying any project artifact.

---

## 1. Tech Stack

| Layer             | Technology                                     |
| ----------------- | ---------------------------------------------- |
| Framework         | Next.js 16 (App Router, React 19, TypeScript)  |
| Styling           | Tailwind CSS v4 (`@theme inline` tokens)       |
| Component Library | shadcn/ui (Nova preset, Radix primitives)      |
| Database          | SQLite via `better-sqlite3` (single file)      |
| Auth              | NextAuth v5 beta — JWT strategy, 24 h sessions |
| Testing           | Vitest v4 + React Testing Library + jsdom      |
| Package Manager   | npm                                            |
| Runtime           | Node.js (app); edge-safe subset only in proxy  |

**App root:** `innovatepam/` (subdirectory of the git repo root).
All `npm` commands must be run from `innovatepam/`, not the repo root.

Key constraints:

- Use `src/proxy.ts`, NOT `middleware.ts` (Next.js 16 convention).
- Import `auth.config.ts` (edge-safe, no DB) in proxy; import `auth.ts` (full) everywhere else.
- Server components by default; add `"use client"` only when state or browser APIs are needed.
- Design tokens live in `src/app/globals.css` under `@theme inline` — do not add raw hex colours inline.

---

## 2. Specification Structure

Spec artifacts live under `specs/` at the repo root.

```
specs/
├── templates/                         # Reusable blank templates
│   ├── prd-template.md                # Product Requirements Document
│   ├── epic-template.md               # Epic breakdown template
│   └── story-template.md              # User story (INVEST) template
│
└── NNN-<feature-slug>/                # One folder per feature (zero-padded 3-digit prefix)
    ├── spec.md                        # Feature specification (source of truth)
    ├── plan.md                        # Implementation plan / design decisions
    ├── tasks.md                       # Ordered, dependency-aware task list
    ├── data-model.md                  # Schema and entity definitions
    ├── us<N>-<slug>.md                # Individual user stories
    ├── adr/                           # Architecture Decision Records
    │   └── ADR-NNN-<slug>.md
    ├── contracts/
    │   └── api.md                     # API contracts (request/response shapes)
    ├── checklists/
    │   └── requirements.md            # QA / acceptance checklist
    ├── research.md                    # Background research notes
    └── quickstart.md                  # Developer quick-start for this feature
```

Root-level spec files (`spec.md`, `plan.md`, `tasks.md`) are the top-level SpecKit artefacts for the entire project.

---

## 3. Naming Conventions

### Spec files

| Artifact       | Pattern                         | Example                            |
| -------------- | ------------------------------- | ---------------------------------- |
| Feature folder | `NNN-<kebab-case-slug>/`        | `001-innovatepam-portal/`          |
| User story     | `us<N>-<kebab-case-slug>.md`    | `us9-notifications.md`             |
| ADR            | `ADR-NNN-<kebab-case-slug>.md`  | `ADR-002-notification-delivery.md` |
| Template       | `<kebab-case-name>-template.md` | `epic-template.md`                 |

### Source code

| Artifact               | Convention                       | Example                       |
| ---------------------- | -------------------------------- | ----------------------------- |
| React components       | PascalCase `.tsx`                | `NotificationBell.tsx`        |
| API route handlers     | `route.ts` inside segment folder | `app/api/ideas/[id]/route.ts` |
| Lib / utility modules  | camelCase `.ts`                  | `notifications.ts`            |
| Test files             | `<subject>.test.ts[x]`           | `notifications.test.ts`       |
| Type declaration files | camelCase or `next-auth.d.ts`    | `db.ts`, `next-auth.d.ts`     |
| DB schema / seed       | lowercase, no suffix             | `schema.sql`, `seed.ts`       |

### IDs in specifications

| Artifact               | Format    | Example   |
| ---------------------- | --------- | --------- |
| Functional Requirement | `FR-NNN`  | `FR-001`  |
| User Story             | `US-NNN`  | `US-009`  |
| Epic                   | `EP-NNN`  | `EP-001`  |
| ADR                    | `ADR-NNN` | `ADR-002` |
| Acceptance Criterion   | `AC-N`    | `AC-3`    |

---

## 4. File Organisation

```
course_project/                        # Git repo root
├── AGENTS.md                          # ← this file
├── CONSTITUTION.md                    # Project guiding principles
├── README.md
├── ROADMAP.md
├── spec.md                            # Top-level SpecKit spec
├── plan.md                            # Top-level SpecKit plan
├── tasks.md                           # Top-level SpecKit task list
│
├── specs/                             # All specification artefacts
│   ├── templates/                     # Blank templates (PRD, Epic, Story)
│   └── 001-innovatepam-portal/        # Feature-specific specs
│
└── innovatepam/                       # Next.js application root
    ├── src/
    │   ├── app/                       # Next.js App Router pages + API routes
    │   │   ├── (admin)/               # Route group — admin-only pages
    │   │   ├── (auth)/                # Route group — login / register
    │   │   ├── (submitter)/           # Route group — submitter pages
    │   │   └── api/                   # API route handlers
    │   ├── components/                # Shared React components
    │   │   └── ui/                    # shadcn/ui primitives (do not edit directly)
    │   ├── lib/                       # Server-side utilities
    │   │   ├── auth.config.ts         # Edge-safe auth config (no DB import)
    │   │   ├── auth.ts                # Full auth with DB (Node.js only)
    │   │   ├── db/                    # Database singleton, schema, seed
    │   │   └── *.ts                   # Other helpers (validations, utils, …)
    │   ├── types/                     # TypeScript type declarations
    │   └── __tests__/                 # Vitest test files (mirrors src/ structure)
    │       ├── api/                   # DB-logic and integration tests
    │       ├── components/            # RTL component tests
    │       ├── lib/                   # Pure function / utility tests
    │       └── setup.ts               # Global test setup
    ├── innovatepam.db                 # SQLite database (gitignored WAL files)
    ├── uploads/                       # File attachments (gitignored contents)
    └── vitest.config.ts               # Test runner configuration
```

### Rules for AI assistants

1. **Never run `npm` commands from the repo root** — always `cd innovatepam/` first.
2. **Never edit `src/components/ui/`** — these are auto-generated shadcn/ui files; re-generate via `npx shadcn@latest add <component>` instead.
3. **Never import `better-sqlite3` in `proxy.ts` or `auth.config.ts`** — those run on the edge runtime.
4. **Place new tests in `src/__tests__/` mirroring the source path** — e.g., a test for `src/lib/foo.ts` goes in `src/__tests__/lib/foo.test.ts`.
5. **Use in-memory SQLite (`:memory:`) in all tests** — never read or write `innovatepam.db` from tests.
6. **Follow the TDD workflow for new features**: spec → ADR (if needed) → RED tests → implement → GREEN → commit.
