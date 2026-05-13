# InnovatEPAM Portal

An employee innovation management portal that lets EPAM staff submit ideas, attach supporting files, and receive structured evaluations from admins. Built with Next.js 14 App Router, shadcn/ui, Tailwind CSS v4, and SQLite.

Built as part of the EPAM A201 AI-native development course using Spec-Driven Development (SDD) with GitHub SpecKit and GitHub Copilot.

---

## Tech Stack

| Layer           | Technology                                                 |
| --------------- | ---------------------------------------------------------- |
| Framework       | Next.js 14+ (App Router, server components)                |
| UI Components   | shadcn/ui (New York style)                                 |
| Styling         | Tailwind CSS v4 (`@theme` design tokens in `globals.css`)  |
| Database        | SQLite via `better-sqlite3` (synchronous)                  |
| Auth            | NextAuth.js v5 — Credentials provider, JWT sessions (24 h) |
| Validation      | Zod — schemas shared between client and server             |
| Date formatting | date-fns                                                   |
| Notifications   | Sonner (toast)                                             |

---

## Prerequisites

- Node.js 20+
- npm 10+

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local

# 3. Create uploads directory
mkdir -p uploads

# 4. Seed the database with test accounts
npx tsx src/lib/db/seed.ts

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Test Accounts

| Role      | Email            | Password     |
| --------- | ---------------- | ------------ |
| Admin     | `admin@epam.com` | `Admin1234!` |
| Submitter | `alice@epam.com` | `Test1234!`  |
| Submitter | `bob@epam.com`   | `Test1234!`  |

---

## Features

### Phase 1 — Core Portal (US1–US5)

- Employee registration and role-based login (`submitter` → `/dashboard`, `admin` → `/admin`)
- Idea submission with optional single file attachment (PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, MP4; ≤ 10 MB)
- Submitter dashboard — personal idea list with colour-coded status badges
- Idea detail view — full content, attachment download, evaluation notes
- Admin idea listing with status filter
- Admin evaluation workflow — accept / reject / under review with notes; re-evaluation supported

### Phase 2 — Smart Submission Forms (US6) _(planned)_

- Dynamic category-specific fields revealed on category selection

### Phase 3 — Multi-Media Attachments (US7) _(planned)_

- Up to 5 files per idea; inline image thumbnails on detail page

### Phase 4 — Draft Management (US8) _(planned)_

- Save, edit, and submit idea drafts across sessions

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # /login, /register
│   ├── (submitter)/          # /dashboard, /submit  (any authenticated user)
│   ├── (admin)/admin/        # /admin, /admin/ideas, /admin/ideas/[id]/evaluate
│   ├── ideas/[id]/           # Shared read-only idea detail view
│   └── api/                  # Route handlers (users, ideas, evaluate, attachments, auth)
├── components/
│   ├── ui/                   # shadcn/ui generated components (do not edit)
│   ├── IdeaCard.tsx
│   ├── IdeaForm.tsx
│   ├── StatusBadge.tsx
│   ├── EvaluationForm.tsx
│   ├── StatusFilter.tsx
│   ├── Navbar.tsx
│   └── AttachmentList.tsx
└── lib/
    ├── db/                   # schema.sql, better-sqlite3 singleton, seed.ts
    ├── auth.ts               # NextAuth config
    ├── validations.ts        # Zod schemas (RegisterSchema, LoginSchema, IdeaSchema, EvaluationSchema)
    └── utils.ts              # cn(), formatDate(), formatDateTime()

uploads/                      # File storage — gitignored, outside public/
innovatepam.db                # SQLite database — gitignored
```

---

## API Routes

| Method | Path                                         | Description                                       |
| ------ | -------------------------------------------- | ------------------------------------------------- |
| POST   | `/api/users`                                 | Register new account                              |
| GET    | `/api/ideas`                                 | List ideas (submitter: own; admin: all non-draft) |
| POST   | `/api/ideas`                                 | Create idea (add `?draft=true` for draft)         |
| GET    | `/api/ideas/[id]`                            | Idea detail with evaluation and attachments       |
| PATCH  | `/api/ideas/[id]`                            | Update draft idea                                 |
| POST   | `/api/ideas/[id]/evaluate`                   | Upsert evaluation (admin only)                    |
| POST   | `/api/ideas/[id]/attachments`                | Upload file attachment                            |
| GET    | `/api/ideas/[id]/attachments/[attachmentId]` | Download attachment (owner + admins)              |

---

## SDD Artifacts

This project was built spec-first using [GitHub SpecKit](https://github.com/github/spec-kit):

| Artifact                                                                                       | Purpose                                                            |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [CONSTITUTION.md](CONSTITUTION.md)                                                             | Non-negotiable project principles — supersedes all other patterns  |
| [specs/001-innovatepam-portal/spec.md](specs/001-innovatepam-portal/spec.md)                   | 8 user stories, 20 FRs, 13 resolved clarifications                 |
| [specs/001-innovatepam-portal/plan.md](specs/001-innovatepam-portal/plan.md)                   | Architecture, schema, auth/upload flows, 8 implementation phases   |
| [specs/001-innovatepam-portal/data-model.md](specs/001-innovatepam-portal/data-model.md)       | Entity definitions, relationships, status lifecycle, design tokens |
| [specs/001-innovatepam-portal/contracts/api.md](specs/001-innovatepam-portal/contracts/api.md) | Full REST API contract with request/response shapes                |
| [specs/001-innovatepam-portal/quickstart.md](specs/001-innovatepam-portal/quickstart.md)       | Setup guide and per-story manual test walkthrough                  |
| [specs/001-innovatepam-portal/tasks.md](specs/001-innovatepam-portal/tasks.md)                 | 66 actionable tasks across 11 phases                               |

---

## Before Every Commit

```bash
npm run lint
npm run build
```

Both must pass with zero errors.

---

## License

Built for educational purposes — EPAM A201 course project.
