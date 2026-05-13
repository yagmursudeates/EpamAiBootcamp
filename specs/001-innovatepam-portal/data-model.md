# Data Model: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Phase**: 1 — Design

---

## Entities

### User

Represents an authenticated EPAM employee. Created at registration; role is immutable after creation.

| Field           | Type | Constraints                               | Notes                                            |
| --------------- | ---- | ----------------------------------------- | ------------------------------------------------ |
| `id`            | TEXT | PRIMARY KEY                               | UUID v4                                          |
| `name`          | TEXT | NOT NULL                                  | Display name                                     |
| `email`         | TEXT | NOT NULL, UNIQUE                          | Login identifier                                 |
| `password_hash` | TEXT | NOT NULL                                  | bcrypt hash (rounds: 12); plaintext never stored |
| `role`          | TEXT | NOT NULL, CHECK IN (`submitter`, `admin`) | Assigned at registration; `submitter` by default |
| `created_at`    | TEXT | NOT NULL, DEFAULT `datetime('now')`       | ISO 8601 UTC                                     |

**Business Rules**:

- Registration always creates a `submitter`. Admin accounts created via `seed.ts` only.
- Email must be globally unique; duplicate registration returns HTTP 409.
- Password minimum 8 characters (enforced by `RegisterSchema` + DB is secondary gate).

---

### Idea

Central domain entity. Owned by a submitter; evaluated by admins.

| Field               | Type | Constraints                          | Notes                                         |
| ------------------- | ---- | ------------------------------------ | --------------------------------------------- |
| `id`                | TEXT | PRIMARY KEY                          | UUID v4                                       |
| `title`             | TEXT | NOT NULL                             | Max 100 chars (Zod); not enforced in DB       |
| `description`       | TEXT | NOT NULL                             | Max 2000 chars (Zod)                          |
| `category`          | TEXT | NOT NULL, CHECK                      | One of 5 fixed values (see below)             |
| `status`            | TEXT | NOT NULL, DEFAULT `submitted`, CHECK | See status lifecycle                          |
| `category_metadata` | TEXT | NULL                                 | JSON blob; populated by Smart Forms (Phase 5) |
| `submitter_id`      | TEXT | NOT NULL, FK → `users.id`            | Owner                                         |
| `created_at`        | TEXT | NOT NULL, DEFAULT `datetime('now')`  | ISO 8601 UTC                                  |
| `updated_at`        | TEXT | NOT NULL, DEFAULT `datetime('now')`  | Updated on every PATCH/evaluate               |

**Category Enum** (5 values):

```
Technical | Process Improvement | Client Solutions | Cost Reduction | Employee Experience
```

**Status Enum** (5 values):

```
submitted | under_review | accepted | rejected | draft
```

**Business Rules**:

- A new idea created via `POST /api/ideas` defaults to `submitted` (unless `?draft=true`).
- Ideas with status `submitted`, `under_review`, `accepted`, or `rejected` are **read-only** for the submitter (CL-004).
- Only `draft` ideas can be edited or deleted by their owner.
- Admins never see `draft` ideas — not in list, 403 on direct URL (CL-010).
- `updated_at` is set via an application-level timestamp (no SQLite trigger needed).

**Category Metadata Schema** (Phase 5 — stored as JSON string in `category_metadata`):

| Category            | Fields                                                          |
| ------------------- | --------------------------------------------------------------- |
| Technical           | `{ technologyStack: string, implementationComplexity: string }` |
| Process Improvement | `{ affectedDepartment: string, estimatedTimeSaving: string }`   |
| Client Solutions    | `{ targetClientSegment: string, revenueImpact: string }`        |
| Cost Reduction      | `{ costSavingEstimate: string, affectedArea: string }`          |
| Employee Experience | `{ targetAudience: string, expectedImpact: string }`            |

---

### Attachment

A file linked to an idea. Stored on disk; row tracks metadata.

| Field        | Type    | Constraints                                 | Notes                                                                  |
| ------------ | ------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| `id`         | TEXT    | PRIMARY KEY                                 | UUID v4                                                                |
| `idea_id`    | TEXT    | NOT NULL, FK → `ideas.id` ON DELETE CASCADE | Parent idea                                                            |
| `filename`   | TEXT    | NOT NULL                                    | Original filename (sanitised before storage)                           |
| `filepath`   | TEXT    | NOT NULL                                    | Relative path from project root: `uploads/<idea-id>/<uuid>-<filename>` |
| `mimetype`   | TEXT    | NOT NULL                                    | Validated against allowlist server-side                                |
| `size`       | INTEGER | NOT NULL                                    | Bytes                                                                  |
| `created_at` | TEXT    | NOT NULL, DEFAULT `datetime('now')`         | ISO 8601 UTC                                                           |

**Allowed MIME Types** (CL-005):

```
application/pdf
application/vnd.openxmlformats-officedocument.wordprocessingml.document   (DOCX)
application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet         (XLSX)
image/png | image/jpeg | image/gif
video/mp4
```

**Business Rules**:

- Maximum 1 attachment in Phase 1 (US2); up to 5 from Phase 6 (US7).
- Max file size: 10 MB per file.
- Access restricted to owner + admins (CL-007). Download via authenticated API route.
- Files are NOT served from `public/` — stored in `uploads/` (gitignored).
- `ON DELETE CASCADE`: deleting an idea deletes all its attachment rows; application also deletes disk files.

---

### Evaluation

Admin decision on an idea. One row per idea; upserted on re-evaluation.

| Field          | Type | Constraints                                                 | Notes                                          |
| -------------- | ---- | ----------------------------------------------------------- | ---------------------------------------------- |
| `id`           | TEXT | PRIMARY KEY                                                 | UUID v4                                        |
| `idea_id`      | TEXT | NOT NULL, **UNIQUE**, FK → `ideas.id` ON DELETE CASCADE     | Uniqueness enforces one-per-idea               |
| `evaluator_id` | TEXT | NOT NULL, FK → `users.id`                                   | Admin who made/last updated decision           |
| `decision`     | TEXT | NOT NULL, CHECK IN (`under_review`, `accepted`, `rejected`) | **`submitted` is NOT a valid decision**        |
| `notes`        | TEXT | NULL                                                        | Optional evaluation notes visible to submitter |
| `created_at`   | TEXT | NOT NULL, DEFAULT `datetime('now')`                         | ISO 8601 UTC                                   |
| `updated_at`   | TEXT | NOT NULL, DEFAULT `datetime('now')`                         | Updated on every upsert                        |

**Business Rules**:

- Submitting an evaluation UPSERTs: if a row exists for `idea_id`, it is overwritten (CL-011).
- Simultaneously updates `ideas.status` to match `decision` value in a single DB transaction.
- `submitted` is **not** in the `decision` CHECK — it is the system-assigned initial status and cannot be set by an evaluator.
- Any admin can re-evaluate at any time; no final state (CL-002).

---

## Relationships

```
User (1) ──────< Idea (many)         submitter_id FK
User (1) ──────< Evaluation (many)   evaluator_id FK
Idea (1) ──────< Attachment (many)   idea_id FK  ON DELETE CASCADE
Idea (1) ──────o Evaluation (0..1)   idea_id FK  UNIQUE  ON DELETE CASCADE
```

---

## Status Lifecycle

```
                     ┌──────────────────────────────────────────────────┐
                     │                  Admin re-evaluates (CL-002)      │
                     ▼                                                    │
[new idea] ──► submitted ──► under_review ──► accepted ────────────────►│
                                    │                                     │
                                    └──────────► rejected ───────────────┘

[save draft] ──► draft ──► [edit] ──► submitted (on submit)
```

- `draft` is a terminal state until the owner explicitly submits.
- `submitted`, `under_review`, `accepted`, `rejected` transition only via admin evaluation.
- There are no forbidden transitions in the DB; business logic is enforced at the API layer.

---

## Design Tokens (Tailwind `@theme`)

Defined in `src/app/globals.css`:

| Token                         | Value     | Usage                              |
| ----------------------------- | --------- | ---------------------------------- |
| `--color-brand-primary`       | `#0057B8` | EPAM blue; navbar, primary buttons |
| `--color-brand-secondary`     | `#00A9E0` | Accent, links                      |
| `--color-status-submitted`    | `#6B7280` | StatusBadge for `submitted`        |
| `--color-status-under-review` | `#D97706` | StatusBadge for `under_review`     |
| `--color-status-accepted`     | `#16A34A` | StatusBadge for `accepted`         |
| `--color-status-rejected`     | `#DC2626` | StatusBadge for `rejected`         |
| `--color-status-draft`        | `#9CA3AF` | StatusBadge for `draft`            |
| `--radius-card`               | `0.75rem` | Card border radius                 |

Usage in `StatusBadge`:

```tsx
// Maps idea.status to the corresponding @theme color token
const colorMap: Record<Status, string> = {
  submitted: "bg-[--color-status-submitted]",
  under_review: "bg-[--color-status-under-review]",
  accepted: "bg-[--color-status-accepted]",
  rejected: "bg-[--color-status-rejected]",
  draft: "bg-[--color-status-draft]",
};
```

---

## Seed Data

Created by `src/lib/db/seed.ts`. Run with `npx tsx src/lib/db/seed.ts`.

| Role      | Email          | Password   | Name        |
| --------- | -------------- | ---------- | ----------- |
| admin     | admin@epam.com | Admin1234! | Admin User  |
| submitter | alice@epam.com | Test1234!  | Alice Smith |
| submitter | bob@epam.com   | Test1234!  | Bob Jones   |
