<!--
SYNC IMPACT REPORT
Version change: (new) → 1.0.0
Added sections: Core Principles (I–V), Security Requirements, Development Workflow, Governance
Modified principles: N/A (initial ratification)
Templates updated:
  ✅ .specify/memory/constitution.md — filled from root CONSTITUTION.md
  ✅ CONSTITUTION.md (repo root) — canonical source, kept in sync
  ✅ .github/copilot-instructions.md — references constitution
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

**Version**: 1.0.0 | **Ratified**: 2026-05-13 | **Last Amended**: 2026-05-13
