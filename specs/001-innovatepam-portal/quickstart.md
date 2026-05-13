# Quickstart: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal`

Get the portal running locally in under 5 minutes.

---

## Prerequisites

| Tool    | Version | Check            |
| ------- | ------- | ---------------- |
| Node.js | 20+     | `node --version` |
| npm     | 10+     | `npm --version`  |
| Git     | any     | `git --version`  |

---

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd innovatepam
npm install
```

---

## 2. Environment Setup

Create a `.env.local` file at the project root:

```bash
# .env.local
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Generate a strong secret:

```bash
openssl rand -base64 32
```

> `.env.local` is gitignored — never commit it.

---

## 3. Database Setup

The database is created automatically on first run. To populate seed accounts:

```bash
npx tsx src/lib/db/seed.ts
```

This creates:

| Role      | Email          | Password   |
| --------- | -------------- | ---------- |
| Admin     | admin@epam.com | Admin1234! |
| Submitter | alice@epam.com | Test1234!  |
| Submitter | bob@epam.com   | Test1234!  |

> `innovatepam.db` is gitignored. The `uploads/` directory is also gitignored — create it if it doesn't exist:
>
> ```bash
> mkdir -p uploads
> ```

---

## 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

---

## 5. Manual Acceptance Test Walkthrough

Work through these scenarios to verify each phase:

### Phase 1 — Auth (US1)

1. Visit `/register` → register with a new email → confirm redirect to `/dashboard`
2. Log out → log back in → confirm redirect to `/dashboard`
3. Log in as `admin@epam.com` → confirm redirect to `/admin`
4. Try wrong password → confirm "Invalid email or password" message
5. Open a private/incognito window → try `/dashboard` without logging in → confirm redirect to `/login`

### Phase 2 — Submission (US2)

1. Log in as `alice@epam.com` → go to `/submit`
2. Submit with all required fields → confirm redirect to `/dashboard` with success toast
3. Try submitting without title → confirm inline validation error
4. Attach a PDF ≤ 10 MB → confirm it uploads and appears in idea detail
5. Try attaching a `.exe` file → confirm "File type not supported"
6. Try attaching a file > 10 MB → confirm "File must be under 10 MB"

### Phase 3 — Dashboard (US3)

1. Visit `/dashboard` as `alice` → confirm idea list shows title, category, status badge, date
2. Click an idea → confirm detail page shows full content including attachment link
3. Log in as `bob` (no ideas yet) → confirm empty state with "Submit your first idea" link
4. Evaluate `alice`'s idea as admin → revisit as `alice` → confirm status badge and notes updated

### Phase 4 — Admin (US4 + US5)

1. Log in as `admin` → visit `/admin` → confirm idea count cards by status
2. Visit `/admin/ideas` → confirm all ideas visible with submitter names
3. Filter by `submitted` → confirm only submitted ideas shown
4. Click an idea → click "Evaluate" → select `accepted` + add notes → submit
5. Confirm idea status changed immediately in the list

### Phase 5 — Smart Forms (US6)

1. On `/submit`, select "Technical" → confirm "Technology Stack" and "Implementation Complexity" appear
2. Switch to "Process Improvement" → confirm Technical fields disappear, new fields appear
3. Submit without filling a required category field → confirm validation error

### Phase 6 — Multi-Media (US7)

1. Attach 3 different file types → confirm all listed before submission
2. Try attaching a 6th file → confirm "Maximum 5 attachments allowed"
3. After submission, view detail → confirm image thumbnails inline, other files as download links

### Phase 7 — Drafts (US8)

1. On `/submit`, fill partial form → click "Save Draft" → confirm draft saved
2. Visit `/dashboard` → confirm draft in "My Drafts" section
3. Click "Edit" on draft → confirm form pre-filled
4. Click "Submit" on draft → confirm it moves to main idea list with status `submitted`
5. Log in as `admin` → confirm draft does not appear in `/admin/ideas`
6. As admin, try to navigate directly to `/ideas/<draft-id>` → confirm 403

---

## 6. Build Check

Before every commit:

```bash
npm run lint
npm run build
```

Both must pass with zero errors.

---

## 7. Project Structure Reference

```
src/app/          → Next.js pages (App Router)
src/components/   → React components (ui/ = shadcn generated)
src/lib/          → db/, auth.ts, validations.ts, utils.ts
src/middleware.ts → route guards
uploads/          → file storage (gitignored)
innovatepam.db    → SQLite database (gitignored)
```

Full structure: see [plan.md](plan.md#source-code-repository-root).

---

## 8. Troubleshooting

| Symptom                                      | Fix                                                              |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `Error: Cannot find module 'better-sqlite3'` | Run `npm install`                                                |
| `Error: NEXTAUTH_SECRET is not set`          | Add `NEXTAUTH_SECRET` to `.env.local`                            |
| DB file missing / corrupt                    | Delete `innovatepam.db` and re-run seed                          |
| `uploads/` permission error                  | `mkdir -p uploads && chmod 755 uploads`                          |
| Tailwind classes not applying                | Ensure `globals.css` has `@import "tailwindcss"` before `@theme` |
| shadcn component missing                     | `npx shadcn@latest add <component-name>`                         |
