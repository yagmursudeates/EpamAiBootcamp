# InnovatEPAM Portal — Development Roadmap

> Stack: **Next.js 14+ · React 18 · Tailwind CSS · shadcn/ui · SQLite**
> Methodology: **Spec-Driven Development (SDD) with GitHub SpecKit**
> Primary AI Tool: **GitHub Copilot**

---

## How to Read This Roadmap

Every phase follows the same SDD loop:

```
Spec → Plan → Tasks → Build → Verify → Commit
```

**Requirements are authoritative.** Mockups are inspirational only — when they conflict, requirements win.

---

## Pre-Development Checklist

Before writing a single line of application code:

- [ ] Create a Git repository and share the link with the instructor
- [ ] Confirm Node.js 18+ and npm/pnpm are installed
- [ ] Confirm GitHub Copilot is active in VS Code
- [ ] Install `specify` CLI (GitHub SpecKit): `uvx --from git+https://github.com/github/spec-kit.git specify init`
- [ ] Scaffold the Next.js project (see **Project Initialization** below)
- [ ] Initialize SpecKit inside the project
- [ ] Review `speckit-cheatsheet.md` so every command is familiar

---

## Project Initialization

```bash
# 1. Create the app
npx create-next-app@latest innovatepam \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd innovatepam

# 2. Add shadcn/ui
npx shadcn@latest init

# 3. Add SQLite support
npm install better-sqlite3
npm install -D @types/better-sqlite3

# 4. Add utilities
npm install date-fns uuid bcryptjs sonner
npm install -D @types/bcryptjs prettier prettier-plugin-tailwindcss

# 5. Auth
npm install next-auth

# 6. Validation
npm install zod

# 7. Verify the dev server starts cleanly
npm run dev
```

Commit message: `chore: initialize Next.js project with Tailwind, shadcn/ui, SQLite`

---

## Phase 1 — Core Portal (~6 hours) ★ REQUIRED

> **This is the minimum viable deliverable.** All other phases build on top of it.

### 1.1 · SpecKit Artifacts (30 min)

| Artifact | Command | Output file |
|---|---|---|
| Constitution | `/speckit.constitution` | `CONSTITUTION.md` |
| Spec | `/speckit.specify` | `spec.md` |
| Plan | `/speckit.plan` | `plan.md` |
| Tasks | `/speckit.tasks` | `tasks.md` |

**Do this before touching the database or UI.**

---

### 1.2 · Database Schema (45 min)

| Table | Key Columns |
|---|---|
| `users` | `id`, `email`, `password_hash`, `role` (`submitter` \| `admin`), `name`, `created_at` |
| `ideas` | `id`, `title`, `description`, `category`, `status` (`submitted` \| `under_review` \| `accepted` \| `rejected`), `submitter_id`, `created_at`, `updated_at` |
| `attachments` | `id`, `idea_id`, `filename`, `filepath`, `mimetype`, `size`, `created_at` |
| `evaluations` | `id`, `idea_id`, `evaluator_id`, `notes`, `decision`, `created_at` |

Commit: `feat(db): add SQLite schema and seed data`

---

### 1.3 · Authentication (1 hr)

- Register page `/app/(auth)/register/page.tsx`
- Login page `/app/(auth)/login/page.tsx`
- Logout action
- Session middleware — protect `/dashboard` and `/admin` routes
- Role guard — admin → `/admin`, submitter → `/dashboard`

Commit: `feat(auth): registration, login, logout with role-based routing`

---

### 1.4 · Idea Submission (1 hr)

- Submission form `/app/(submitter)/submit/page.tsx`
- API route `/app/api/ideas/route.ts` (POST)
- File upload handler `/app/api/ideas/[id]/attachments/route.ts`
- File storage: `uploads/` (gitignored)

Commit: `feat(submit): idea submission form with single file attachment`

---

### 1.5 · Idea Listing & Detail View (45 min)

- Submitter dashboard `/app/(submitter)/dashboard/page.tsx`
- Idea detail page `/app/ideas/[id]/page.tsx`
- Admin idea list `/app/(admin)/admin/ideas/page.tsx`

Status badge colours: `submitted`=gray, `under_review`=yellow, `accepted`=green, `rejected`=red

Commit: `feat(ideas): listing pages and detail view`

---

### 1.6 · Admin Evaluation Workflow (1 hr)

- Admin dashboard `/app/(admin)/admin/page.tsx`
- Evaluation form `/app/(admin)/admin/ideas/[id]/evaluate/page.tsx`
- API route `/app/api/ideas/[id]/evaluate/route.ts` (POST)

Commit: `feat(admin): evaluation workflow with status transitions`

---

### 1.7 · Phase 1 Wrap-Up (30 min)

- [ ] Manual walkthrough of all acceptance criteria
- [ ] Update `tasks.md` statuses
- [ ] Write `PROJECT_SUMMARY.md` section for Phase 1
- [ ] Commit: `docs: update tasks.md and PROJECT_SUMMARY for Phase 1`

---

## Phase 2 — Smart Submission Forms (~30 min)

Dynamic fields based on idea category. Per-category extra fields are **required**.

Commit: `feat(forms): dynamic category-based form fields`

---

## Phase 3 — Multi-Media Support (~45 min)

Multiple file attachments (max 5) with inline image previews.

Commit: `feat(media): multiple file attachments with preview`

---

## Phase 4 — Draft Management (~30 min)

Save as draft, return to edit, submit when ready. Drafts hidden from admins.

Commit: `feat(drafts): save, list, edit, and submit draft ideas`

---

## Phase 5 — Multi-Stage Review (~1 hr)

4-stage evaluation pipeline with stage history.

Commit: `feat(review): 4-stage multi-step evaluation pipeline`

---

## Phase 6 — Blind Review (~20 min)

Admin toggle for anonymous evaluation mode.

Commit: `feat(blind-review): anonymous evaluation mode`

---

## Phase 7 — Scoring System (~20 min)

1–5 rating on multiple dimensions per evaluation.

Commit: `feat(scoring): multi-dimension 1-5 scoring on evaluations`

---

## Final Deliverables Checklist

- [ ] App runs locally with `npm run dev` — no console errors
- [ ] Git history has meaningful, phase-scoped commit messages
- [ ] SpecKit artifacts exist: `CONSTITUTION.md`, `spec.md`, `plan.md`, `tasks.md`
- [ ] `PROJECT_SUMMARY.md` is complete
- [ ] Manual walkthrough passes all Phase 1 acceptance criteria

---

## Key Rules to Stay Within Requirements

1. **Status values** — only: `submitted`, `under_review`, `accepted`, `rejected` (+ `draft` in Phase 4)
2. **Roles** — only two: `submitter` and `admin`
3. **Categories** — exact list: Technical, Process Improvement, Client Solutions, Cost Reduction, Employee Experience
4. **SDD first** — always run `/speckit.specify` + `/speckit.tasks` before coding a new phase
5. **No gold-plating** — do not implement phase 2–7 features while building phase 1
6. **Mockups are not specs** — if a mockup shows something not in requirements, skip it

---

## Time Budget (10-Hour Sprint)

| Block | Activity | Time |
|---|---|---|
| 0:00–0:20 | Kickoff: share repo link | 20 min |
| 0:20–0:50 | SpecKit setup + Phase 1 spec | 30 min |
| 0:50–2:00 | DB schema + Auth | 1 hr 10 min |
| 2:00–2:10 | **Standup #1** | 10 min |
| 2:10–4:00 | Idea submission + listing | 1 hr 50 min |
| 4:00–4:10 | **Standup #2** | 10 min |
| 4:10–6:00 | Admin evaluation + Phase 1 wrap-up | 1 hr 50 min |
| 6:00–6:10 | **Standup #3** | 10 min |
| 6:10–7:30 | Phase 2 + Phase 3 | 1 hr 20 min |
| 7:30–7:40 | **Standup #4** | 10 min |
| 7:40–9:00 | Phase 4+ or polish + PROJECT_SUMMARY | 1 hr 20 min |
| 9:00–9:30 | Final verification + docs | 30 min |
| 9:30–10:10 | **Showcase** | 40 min |

> Aim to finish Phase 1 before Standup #2. Phases 2–7 are bonuses.
