# Implementation Plan: InnovatEPAM Portal

**Branch**: `01-core-portal` | **Date**: 2026-05-13 | **Spec**: [spec.md](spec.md)

## Summary

Build a full-stack employee innovation management portal using Next.js 14 App Router. Employees submit ideas with file attachments; admins evaluate and update statuses. Authentication is credential-based with role-aware routing. Data is persisted in SQLite via `better-sqlite3`. UI is built entirely with shadcn/ui components styled through Tailwind CSS v4 `@theme` tokens. No automated tests — manual acceptance criteria walkthrough is the quality gate.

---

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20+

**Framework**: Next.js 14+ (App Router, server components by default)

**Primary Dependencies**:
- `next`, `react`, `react-dom` — framework
- `tailwindcss` v4 with `@theme` CSS custom properties — styling
- `shadcn/ui` (via `npx shadcn@latest init`) — UI component library
- `better-sqlite3` — SQLite data access
- `next-auth` v5 (Auth.js) — Credentials provider, JWT sessions
- `bcryptjs` — password hashing
- `zod` — schema validation at all API boundaries
- `date-fns` — date formatting throughout the UI
- `uuid` — ID generation
- `sonner` — toast notifications

**Storage**: SQLite (single file: `innovatepam.db` in project root, gitignored)

**Testing**: None — manual walkthrough against acceptance scenarios is sufficient

**Target Platform**: Local development server (macOS/Linux), browser

**Project Type**: Full-stack web application (monorepo — Next.js handles both frontend and API)

**Performance Goals**: No specific SLA; must feel responsive for ~10 concurrent dev users

**Constraints**:
- No CSS-in-JS; Tailwind `@theme` tokens only
- No new dependencies outside the permitted list without justification
- File uploads stored in `uploads/` at project root (outside `public/`); max 10 MB per file
- JWT sessions expire in 24 hours

**Scale/Scope**: Single-instance local app; ~5 screens, ~10 API routes

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Clean Code | ✅ | Functions ≤ 30 lines enforced by code review; ESLint + Prettier configured at project init |
| II. Simple & Responsive UI | ✅ | Mobile-first Tailwind, shadcn/ui components, WCAG AA contrast via `@theme` tokens |
| III. Minimal Dependencies | ✅ | All deps are on the permitted list; no extras introduced in this plan |
| IV. Next.js + React + Tailwind | ✅ | App Router, server components by default, `"use client"` only where needed |
| V. SDD Workflow | ✅ | This plan follows spec.md; tasks.md generated next |
| Security | ✅ | bcrypt passwords, Zod validation, role guards in middleware, files outside web root |

---

## Project Structure

### Source Code

```text
innovatepam/                          ← Next.js app root (npm project)
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← root layout (fonts, Toaster)
│   │   ├── page.tsx                  ← redirect → /login
│   │   ├── globals.css               ← Tailwind @import + @theme tokens
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (submitter)/
│   │   │   ├── layout.tsx            ← guard: any authenticated user
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          ← submitter's idea list + drafts (Phase 4)
│   │   │   └── submit/
│   │   │       └── page.tsx          ← idea submission form
│   │   ├── (admin)/
│   │   │   ├── layout.tsx            ← guard: admin only
│   │   │   └── admin/
│   │   │       ├── page.tsx          ← admin dashboard (counts by status)
│   │   │       └── ideas/
│   │   │           ├── page.tsx      ← all ideas list with status filter
│   │   │           └── [id]/
│   │   │               └── evaluate/
│   │   │                   └── page.tsx
│   │   ├── ideas/
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← shared read-only detail view
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts      ← NextAuth handler
│   │       ├── ideas/
│   │       │   ├── route.ts          ← GET (list) + POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts      ← GET (detail) + PATCH (update draft)
│   │       │       ├── evaluate/
│   │       │       │   └── route.ts  ← POST (upsert evaluation)
│   │       │       └── attachments/
│   │       │           └── route.ts  ← POST (upload), GET (download)
│   │       └── users/
│   │           └── route.ts          ← POST (register)
│   ├── components/
│   │   ├── ui/                       ← shadcn/ui generated components (do not edit)
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaForm.tsx              ← Phase 2: becomes dynamic by category
│   │   ├── StatusBadge.tsx
│   │   ├── EvaluationForm.tsx
│   │   ├── StatusFilter.tsx          ← client component for admin filter
│   │   ├── Navbar.tsx
│   │   └── AttachmentList.tsx        ← Phase 3: multi-file preview
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              ← better-sqlite3 singleton connection
│   │   │   ├── schema.sql            ← CREATE TABLE statements
│   │   │   └── seed.ts               ← 1 admin + 2 submitter accounts
│   │   ├── auth.ts                   ← NextAuth config (Credentials provider)
│   │   ├── validations.ts            ← Zod schemas (shared client + server)
│   │   └── utils.ts                  ← cn(), formatDate() (date-fns wrapper)
│   └── middleware.ts                 ← route guards by role
├── uploads/                          ← file storage (gitignored, outside public/)
├── innovatepam.db                    ← SQLite database (gitignored)
├── .env.local                        ← NEXTAUTH_SECRET, etc. (gitignored)
├── .prettierrc                       ← Prettier config
├── components.json                   ← shadcn/ui config
└── package.json
```

---

## Design Decisions

### Tailwind CSS v4 `@theme` for Design Tokens

All brand colours, radii, and spacing overrides live in `globals.css` under `@theme`:

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-primary: #0057B8;       /* EPAM blue */
  --color-brand-secondary: #00A9E0;
  --color-status-submitted: #6B7280;    /* gray-500 */
  --color-status-under-review: #D97706; /* amber-600 */
  --color-status-accepted: #16A34A;     /* green-600 */
  --color-status-rejected: #DC2626;     /* red-600 */
  --color-status-draft: #9CA3AF;        /* gray-400 */
  --radius-card: 0.75rem;
}
```

shadcn/ui components inherit these tokens automatically. `StatusBadge` maps idea status → `--color-status-*` token.

---

### SQLite Schema

```sql
-- src/lib/db/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL CHECK(role IN ('submitter', 'admin')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ideas (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL CHECK(category IN (
                'Technical', 'Process Improvement',
                'Client Solutions', 'Cost Reduction', 'Employee Experience'
              )),
  status      TEXT NOT NULL DEFAULT 'submitted'
              CHECK(status IN ('submitted','under_review','accepted','rejected','draft')),
  category_metadata TEXT,              -- JSON blob (Phase 2)
  submitter_id TEXT NOT NULL REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attachments (
  id          TEXT PRIMARY KEY,
  idea_id     TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  filepath    TEXT NOT NULL,
  mimetype    TEXT NOT NULL,
  size        INTEGER NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evaluations (
  id          TEXT PRIMARY KEY,
  idea_id     TEXT NOT NULL UNIQUE REFERENCES ideas(id) ON DELETE CASCADE,
  evaluator_id TEXT NOT NULL REFERENCES users(id),
  decision    TEXT NOT NULL CHECK(decision IN ('under_review','accepted','rejected')),
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
-- UNIQUE on idea_id enforces CL-011: one evaluation per idea (upsert pattern)
-- 'submitted' intentionally excluded from decision enum: it is the system-assigned initial status, not an evaluator choice
```

---

### Authentication Flow

```
POST /api/users          → register (bcryptjs.hash, insert user)
POST /api/auth/callback/credentials → NextAuth verifies email+password
middleware.ts            → reads session token, enforces role guards:
  /admin/*               → role === 'admin' only  (→ /dashboard if not)
  /dashboard, /submit, /ideas/* → any authenticated user (→ /login if not)
  /login, /register      → redirect to role destination if already logged in
```

JWT payload: `{ id, name, email, role }`. Expiry: 24h (CL-012).

---

### File Upload Flow

```
Client → multipart/form-data POST /api/ideas/[id]/attachments
Server:
  1. Parse with native Request.formData()
  2. Validate MIME type against allowlist (CL-005):
     PDF, DOCX, PPTX, XLSX, PNG, JPG/JPEG, GIF, MP4
  3. Validate size ≤ 10 MB
  4. Write to uploads/<idea-id>/<uuid>-<filename>
  5. Insert row into attachments table
  6. Return { id, filename, size }

Download: GET /api/ideas/[id]/attachments/[attachmentId]
  → verifies session + ownership/admin role (CL-007)
  → streams file from disk
```

---

### Date Formatting Convention

All dates displayed in the UI use `date-fns/format`:

```ts
// src/lib/utils.ts
import { format } from 'date-fns'
export const formatDate = (iso: string) => format(new Date(iso), 'MMM d, yyyy')
export const formatDateTime = (iso: string) => format(new Date(iso), 'MMM d, yyyy HH:mm')
```

---

### shadcn/ui Component Usage Map

| UI Element | shadcn Component |
|---|---|
| Forms | `<Form>`, `<FormField>`, `<FormItem>`, `<FormMessage>` |
| Inputs | `<Input>`, `<Textarea>`, `<Select>` |
| Status badge | `<Badge>` with `--color-status-*` token |
| Navigation | `<Button>`, `<DropdownMenu>` |
| Success/error feedback | `<Sonner>` toast (via `sonner`) |
| Dialogs / confirmations | `<Dialog>`, `<AlertDialog>` |
| Cards | `<Card>`, `<CardHeader>`, `<CardContent>` |
| Loading skeleton | `<Skeleton>` |
| Admin stats | `<Card>` grid |
| Empty states | Custom with `<Card>` + `<Button>` |

---

## Implementation Phases

### Phase 0 — Project Scaffold
1. `npx create-next-app@latest innovatepam --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2. `npx shadcn@latest init` — select New York style, CSS variables on
3. Install deps: `better-sqlite3 bcryptjs next-auth zod date-fns uuid sonner`
4. Install dev deps: `@types/better-sqlite3 @types/bcryptjs prettier prettier-plugin-tailwindcss`
5. Create `.prettierrc`
6. Configure `@theme` tokens in `globals.css`
7. Create `uploads/` dir, add to `.gitignore` along with `.github/`
8. Create `.env.local` with `NEXTAUTH_SECRET`

### Phase 1 — Database + Auth
1. Write `schema.sql` and `src/lib/db/index.ts` (singleton, runs schema on startup)
2. Write `seed.ts` (1 admin, 2 submitters)
3. Configure NextAuth in `src/lib/auth.ts` + `api/auth/[...nextauth]/route.ts`
4. Write `middleware.ts` for role-based route guards
5. Build `/register` and `/login` pages with shadcn `<Form>` + Zod validation

### Phase 2 — Idea Submission
1. Create `validations.ts` — `IdeaSchema`, `AttachmentSchema`
2. Build `POST /api/ideas` route with Zod validation
3. Build `POST /api/ideas/[id]/attachments` upload route
4. Build `/submit` page with `IdeaForm` component
5. Redirect to `/dashboard` with toast on success (CL-003)

### Phase 3 — Dashboard + Detail View
1. Build `GET /api/ideas` (submitter: own ideas; admin: all)
2. Build `GET /api/ideas/[id]` (with ownership/draft checks)
3. Build attachment download route (auth-gated per CL-007)
4. Build `/dashboard` page with `IdeaCard` + `StatusBadge` + empty state
5. Build `/ideas/[id]` detail page

### Phase 4 — Admin Panel + Evaluation
1. Build `POST /api/ideas/[id]/evaluate` (upsert evaluation, update idea status)
2. Build `/admin` dashboard (counts per status)
3. Build `/admin/ideas` list with status filter
4. Build `/admin/ideas/[id]/evaluate` page with `EvaluationForm`

### Phase 5+ — Later Phases (Project Roadmap Phases 2–4)
- Phase 2 (Smart Forms): conditional fields per category, store in `category_metadata` JSON
- Phase 3 (Multi-Media): multiple files + image previews via `AttachmentList`
- Phase 4 (Drafts): "Save Draft" button, "My Drafts" section, edit-draft flow

---

## Complexity Tracking

No constitution violations. All decisions stay within the permitted stack.
