# InnovatEPAM Portal

A comprehensive employee innovation management platform built with Next.js, React, Tailwind CSS, shadcn/ui, and SQLite. Employees submit creative ideas, evaluators review and decide, and the organization tracks innovation from submission to decision.

Built as part of the EPAM A201 AI-native development course using Spec-Driven Development (SDD) with GitHub SpecKit and GitHub Copilot.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| UI | React 18 + shadcn/ui |
| Styling | Tailwind CSS v4 (`@theme` tokens) |
| Database | SQLite via `better-sqlite3` |
| Auth | NextAuth.js v5 (Credentials + JWT) |
| Validation | Zod |
| Date formatting | date-fns |

---

## Prerequisites

- Node.js 20+
- npm 9+

---

## Setup

```bash
# 1. Clone the repo and switch to the project branch
git clone https://github.com/yagmursudeates/EpamAiBootcamp.git
cd EpamAiBootcamp
git checkout course_project

# 2. Go to the app directory
cd innovatepam

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
# Then edit .env.local and set NEXTAUTH_SECRET (see below)

# 5. Generate a secret
openssl rand -base64 32
# Paste the output as NEXTAUTH_SECRET in .env.local

# 6. Seed the database with test accounts
npx tsx src/lib/db/seed.ts

# 7. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@epam.com` | `Admin1234!` |
| Submitter | `alice@epam.com` | `Test1234!` |
| Submitter | `bob@epam.com` | `Test1234!` |

---

## Features

### Phase 1 — Core Portal
- User registration and login
- Role-based access control (submitter / admin)
- Idea submission with single file attachment
- Idea listing and detail view with status tracking
- Admin evaluation workflow (accept / reject / under review)

### Phase 2 — Smart Submission Forms *(planned)*
- Dynamic form fields based on idea category

### Phase 3 — Multi-Media Support *(planned)*
- Multiple file attachments with inline image preview

### Phase 4 — Draft Management *(planned)*
- Save, edit, and submit idea drafts

---

## Project Structure

```
innovatepam/
├── src/
│   ├── app/                  # Next.js App Router pages and API routes
│   │   ├── (auth)/           # Login and register pages
│   │   ├── (submitter)/      # Dashboard and submit pages
│   │   ├── (admin)/          # Admin panel and evaluation pages
│   │   ├── ideas/[id]/       # Shared idea detail view
│   │   └── api/              # API route handlers
│   ├── components/           # Reusable React components
│   └── lib/
│       ├── db/               # SQLite schema, connection, seed
│       ├── auth.ts           # NextAuth config
│       ├── validations.ts    # Zod schemas
│       └── utils.ts          # cn(), formatDate()
└── uploads/                  # File storage (gitignored)
```

---

## SDD Artifacts

This project was built spec-first using [GitHub SpecKit](https://github.com/github/spec-kit):

| File | Purpose |
|---|---|
| [CONSTITUTION.md](CONSTITUTION.md) | Project principles and non-negotiables |
| [spec.md](spec.md) | User stories and acceptance criteria |
| [plan.md](plan.md) | Technical architecture and design decisions |
| [tasks.md](tasks.md) | Actionable implementation task list |

---

## License

Built for educational purposes — EPAM A201 course project.
