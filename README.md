# InnovatEPAM Portal

A full-stack employee innovation management platform for EPAM. Staff submit ideas through a structured form, track them through a multi-stage review pipeline, and receive scored evaluations from admins. Built spec-first using GitHub SpecKit and GitHub Copilot as part of the EPAM A201 AI-native development course.

---

## Tech Stack

| Layer             | Technology                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Framework         | Next.js 16.2.6 (App Router, React 19, TypeScript)                |
| Styling           | Tailwind CSS v4 (`@theme inline` design tokens in `globals.css`) |
| Component Library | shadcn/ui (Nova preset, Radix primitives)                        |
| Database          | SQLite via `better-sqlite3` v12 — single-file, WAL mode          |
| Auth              | NextAuth.js v5 beta — Credentials provider, JWT sessions (24 h)  |
| Validation        | Zod v4 — shared between client and server                        |
| Email             | nodemailer v7 + Ethereal SMTP (fire-and-forget, env-gated)       |
| Toasts            | Sonner                                                           |
| Testing           | Vitest v4 + React Testing Library + jsdom                        |

---

## Prerequisites

- Node.js 20+
- npm 10+

---

## Setup

```bash
# 1. Navigate to the app directory
cd innovatepam

# 2. Install dependencies
npm install

# 3. Create environment file
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local

# 4. (Optional) Email notifications — add to .env.local
# EMAIL_HOST=smtp.ethereal.email
# EMAIL_PORT=587
# EMAIL_USER=your-ethereal-user
# EMAIL_PASS=your-ethereal-pass
# EMAIL_FROM=noreply@innovatepam.com

# 5. Create uploads directory
mkdir -p uploads

# 6. Seed the database with test accounts
npx tsx src/lib/db/seed.ts

# 7. Start the development server
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

### Phase 1 — Core Portal

- Role-based auth: registration, login, JWT sessions (24 h); `submitter` → `/dashboard`, `admin` → `/admin`
- Idea submission with title, description, category (5 options), and optional file attachment
- File validation: MIME type allowlist (PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, MP4) + 20 MB limit server-side
- Attachments stored outside web root; served via authenticated `GET /api/attachments/[id]/download`
- Submitter dashboard with colour-coded status badges and empty state
- Admin idea listing with status filter; evaluation form with decision + notes; re-evaluation supported

### Phase 2 — Smart Submission Forms

- Category-specific dynamic fields revealed on category selection (no page reload)
- `categoryMetadata` stored as JSON and displayed on both admin and submitter detail pages

### Phase 3 — Multi-Media Attachments

- Up to 5 files per idea via custom "📎 Choose files" button (no OS-locale native input)
- File list with per-file remove before submission; attachment list on detail pages

### Phase 4 — Draft Management

- Save incomplete ideas as `draft`; resume editing across sessions; promote to `submitted` when ready
- Drafts shown in a separate "My Drafts" section; invisible to admins even via direct URL

### Phase 5 — Multi-Stage Review Pipeline

- 4-stage pipeline: Submitted → Screening → Under Review → Accepted / Rejected
- Stage-aware evaluation buttons — only valid forward transitions shown
- Every transition logged immutably in `review_stage_history` with evaluator, timestamps, from/to status, and notes
- Terminal-state re-open to `under_review` supported

### Phase 6 — Blind Review & Anonymous Submission

- Global `blind_mode` setting (admin toggle) hides all submitter names across the admin portal
- `BlindModeToggle` client component with optimistic UI and `router.refresh()` after toggle
- Per-idea `is_anonymous` flag set at submission time; persists independently of global toggle
- "🔒 Submitted anonymously" badge shown to submitters on their own anonymous ideas

### Phase 7 — Scoring System

- 1–5 score picker on four dimensions: Innovation, Feasibility, Impact, Clarity
- Live arithmetic average displayed during scoring
- Scores stored as JSON in `evaluations.scores`; bar indicator cards on admin and submitter detail pages

### Bonus Features

- **Email notifications** — nodemailer + Ethereal triggered on evaluation; gated by `EMAIL_HOST` env var
- **In-app notifications** — bell icon with unread count; mark-as-read support
- **Delete ideas / drafts** — hover-reveal delete button on dashboard cards with confirmation dialog; `DELETE /api/ideas/[id]`
- **Back navigation** — "← Back to dashboard" and "← Back to all ideas" links on detail pages
- **Pending evaluation card** — shown when an idea has no evaluation yet (replaces blank space)

---

## Project Structure

```
innovatepam/src/
├── app/
│   ├── (auth)/                    # /login, /register
│   ├── (submitter)/               # /dashboard, /submit, /ideas/[id], /ideas/[id]/edit
│   ├── (admin)/admin/             # /admin/ideas, /admin/ideas/[id]
│   └── api/
│       ├── users/                 # POST — register
│       ├── ideas/                 # GET, POST
│       ├── ideas/[id]/            # GET, PATCH, DELETE
│       ├── ideas/[id]/evaluate/   # POST — upsert evaluation + stage history
│       ├── ideas/[id]/attachments/# POST — upload files
│       ├── attachments/[id]/download/ # GET — authenticated file download
│       ├── notifications/         # GET — list, POST — mark read
│       ├── notifications/[id]/    # PATCH — mark single read
│       └── admin/blind-mode/      # GET, POST — blind mode toggle (admin only)
├── components/
│   ├── ui/                        # shadcn/ui primitives (do not edit)
│   ├── BlindModeToggle.tsx
│   ├── DeleteIdeaButton.tsx
│   ├── EvaluationForm.tsx
│   ├── IdeaCard.tsx
│   ├── IdeaForm.tsx
│   ├── Navbar.tsx
│   ├── NotificationBell.tsx
│   ├── Providers.tsx
│   ├── StatusBadge.tsx
│   └── StatusFilter.tsx
└── lib/
    ├── db/                        # schema.sql, better-sqlite3 singleton, seed.ts
    ├── auth.ts                    # Full NextAuth config (Node.js only)
    ├── auth.config.ts             # Edge-safe config — imported by proxy.ts
    ├── settings.ts                # isBlindMode(), setBlindMode()
    ├── validations.ts             # Zod schemas
    ├── categoryFields.ts          # CATEGORY_FIELDS map + FIELD_LABEL_MAP
    ├── notifications.ts           # createNotification() helper
    └── utils.ts                   # cn(), formatDate(), formatDateTime()

uploads/                           # File storage — gitignored, outside public/
innovatepam.db                     # SQLite database — gitignored
```

---

## API Routes

| Method | Path                             | Auth          | Description                                    |
| ------ | -------------------------------- | ------------- | ---------------------------------------------- |
| POST   | `/api/users`                     | Public        | Register new account                           |
| GET    | `/api/ideas`                     | Any           | Own ideas (submitter) or all non-draft (admin) |
| POST   | `/api/ideas`                     | Any           | Create idea or draft                           |
| GET    | `/api/ideas/[id]`                | Owner / Admin | Idea detail with evaluation and attachments    |
| PATCH  | `/api/ideas/[id]`                | Owner         | Update draft                                   |
| DELETE | `/api/ideas/[id]`                | Owner         | Delete idea or draft                           |
| POST   | `/api/ideas/[id]/evaluate`       | Admin         | Upsert evaluation + record stage history       |
| POST   | `/api/ideas/[id]/attachments`    | Owner         | Upload file(s)                                 |
| GET    | `/api/attachments/[id]/download` | Owner / Admin | Download attachment                            |
| GET    | `/api/notifications`             | Any           | List notifications for current user            |
| PATCH  | `/api/notifications/[id]`        | Any           | Mark notification as read                      |
| GET    | `/api/admin/blind-mode`          | Admin         | Get current blind mode state                   |
| POST   | `/api/admin/blind-mode`          | Admin         | Toggle blind mode                              |

---

## Database Schema

```sql
users               — id, name, email, password_hash, role, created_at
ideas               — id, title, description, category, category_metadata, status,
                      is_anonymous, submitter_id, created_at, updated_at
attachments         — id, idea_id, filename, filepath, mimetype, size, created_at
evaluations         — id, idea_id, evaluator_id, decision, notes, scores (JSON), created_at, updated_at
review_stage_history— id, idea_id, from_status, to_status, evaluator_id, notes, created_at
notifications       — id, user_id, idea_id, message, is_read, created_at
settings            — key (PK), value   [blind_mode: '0'|'1']
```

---

## Testing

```bash
cd innovatepam
npm test          # run all tests once
npm run test:watch # watch mode
```

**109 tests · 13 test files** — all using in-memory SQLite (`:memory:`); never touches `innovatepam.db`.

---

## SDD Artifacts

Built spec-first using [GitHub SpecKit](https://github.com/github/spec-kit):

| Artifact                                                                                       | Purpose                                      |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [CONSTITUTION.md](CONSTITUTION.md)                                                             | Non-negotiable project principles            |
| [specs/001-innovatepam-portal/spec.md](specs/001-innovatepam-portal/spec.md)                   | 11 user stories, 30 FRs, 12 success criteria |
| [specs/001-innovatepam-portal/plan.md](specs/001-innovatepam-portal/plan.md)                   | Architecture, schema, implementation phases  |
| [specs/001-innovatepam-portal/tasks.md](specs/001-innovatepam-portal/tasks.md)                 | 100 tasks (T001–T100), all complete ✅       |
| [specs/001-innovatepam-portal/epics/](specs/001-innovatepam-portal/epics/)                     | 7 epics (EP-001–007)                         |
| [specs/001-innovatepam-portal/stories/](specs/001-innovatepam-portal/stories/)                 | 11 user stories (US-001–011)                 |
| [specs/001-innovatepam-portal/adr/](specs/001-innovatepam-portal/adr/)                         | 3 Architecture Decision Records              |
| [specs/001-innovatepam-portal/contracts/api.md](specs/001-innovatepam-portal/contracts/api.md) | REST API contract                            |
| [specs/001-innovatepam-portal/data-model.md](specs/001-innovatepam-portal/data-model.md)       | Entity definitions and schema                |

---

## License

Built for educational purposes — EPAM A201 course project.

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
