# Research: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Phase**: 0 — Pre-Design Research

All technical choices were explicitly specified in the plan invocation. No NEEDS CLARIFICATION items remain after this research pass.

---

## Decision Log

### 1. Styling — Tailwind CSS v4 `@theme`

**Decision**: Tailwind CSS v4 with `@theme` CSS custom-property block in `src/app/globals.css` as the single source of design tokens.

**Rationale**: Tailwind v4 removes `tailwind.config.ts` in favour of a CSS-native `@theme` block. This co-locates tokens with the stylesheet, works natively with Next.js App Router, and avoids a separate JS config file. shadcn/ui v4 expects this pattern.

**Alternatives considered**:

- `tailwind.config.ts` theme extension — deprecated in v4; generates compiler warnings.
- CSS modules + custom properties — would require maintaining a parallel token system.

**Outcome**: Token map defined in data-model (design tokens section). Zero configuration needed in `tailwind.config.ts`.

---

### 2. Data Persistence — SQLite via `better-sqlite3`

**Decision**: SQLite single-file database (`innovatepam.db` at project root, gitignored) accessed through a `better-sqlite3` singleton in `src/lib/db/index.ts`.

**Rationale**:

- `better-sqlite3` is synchronous, which fits Next.js Server Components and Route Handlers without async-over-sync impedance mismatch.
- Single-file database eliminates Docker/network configuration for a local-dev, single-instance app.
- `better-sqlite3` is the recommended SQLite driver for Node.js in the ecosystem; well-maintained with TypeScript types.
- Performance is more than adequate for ≤ 10 concurrent dev users.

**Alternatives considered**:

- Prisma + SQLite — adds abstraction layer not justified for 4 small tables.
- `sqlite3` (async) — driver-level async adds complexity in RSC context.
- PostgreSQL — over-engineered for a single-instance local app; requires running a database server.

**Outcome**: `better-sqlite3` confirmed. DB singleton runs schema migrations on import (idempotent `CREATE TABLE IF NOT EXISTS`).

---

### 3. UI Components — shadcn/ui (New York style)

**Decision**: `shadcn/ui` with New York style, CSS variables on. Components generated into `src/components/ui/` (do not edit directly).

**Rationale**: shadcn/ui is explicitly listed in the permitted dependencies. New York style has tighter spacing, suited for a data-dense portal. CSS variables mode lets `@theme` tokens propagate into component borders/focus rings without additional configuration.

**Alternatives considered**:

- Radix UI primitives directly — requires manually building all accessible patterns shadcn/ui already provides.
- Mantine / Chakra — introduce non-Tailwind styling systems, violating Principle II.

**Outcome**: Use `Card`, `Badge`, `Button`, `Form`, `Input`, `Textarea`, `Select`, `Dialog`, `Skeleton`, `Sonner` (toast) from shadcn/ui. Custom components (`IdeaCard`, `StatusBadge`, `EvaluationForm`) wrap shadcn primitives — they live in `src/components/`, not `src/components/ui/`.

---

### 4. Date Formatting — `date-fns`

**Decision**: `date-fns v3` `format()` function via thin wrappers in `src/lib/utils.ts`.

**Rationale**: Explicitly required. `date-fns` is tree-shakable (no runtime overhead from unused functions), has no side-effects, and works in both Server and Client components. Two format strings cover all UI needs:

- `'MMM d, yyyy'` → "Jan 5, 2026" (date-only display)
- `'MMM d, yyyy HH:mm'` → "Jan 5, 2026 14:30" (evaluation timestamps)

**Alternatives considered**:

- `Intl.DateTimeFormat` (native) — no extra package, but format strings are less readable and locale behaviour varies across environments.
- `dayjs` — would add a second date library to the tree; `date-fns` already approved.

**Outcome**: Wrapper functions `formatDate()` and `formatDateTime()` in `src/lib/utils.ts`.

---

### 5. Authentication — NextAuth v5 (Auth.js) Credentials Provider + JWT

**Decision**: NextAuth v5 with a single Credentials provider. Sessions stored as JWTs (not database sessions). JWT payload: `{ id, name, email, role }`. Expiry: 24 hours (CL-012).

**Rationale**: Credentials provider avoids OAuth setup complexity. JWT sessions eliminate a `sessions` table and work well with Edge middleware. Role stored in token means zero DB reads during middleware route-guard evaluation. `next-auth` is on the permitted dependency list.

**Alternatives considered**:

- Database sessions — adds a sessions table; query on every request in middleware; unnecessary for a single-instance app.
- Custom JWT implementation — reinventing what NextAuth already provides securely.

**Outcome**: Auth config in `src/lib/auth.ts`. JWT secret from `NEXTAUTH_SECRET` env var. Middleware reads `auth()` to enforce role guards without a DB call.

---

### 6. Testing Strategy — None (Manual Only)

**Decision**: No automated tests (no unit, integration, or e2e).

**Rationale**: Explicitly excluded by the user. Quality gate is manual walkthrough against the acceptance scenarios in `spec.md`. Each scenario is phrased in Given/When/Then making them directly walkable.

**Alternatives considered**: None — this is a hard requirement.

**Outcome**: No `__tests__/` directory, no test dependencies (`jest`, `vitest`, `playwright` etc.), no test scripts in `package.json` beyond what `create-next-app` adds by default.

---

### 7. File Upload Strategy

**Decision**: Native `Request.formData()` in Next.js Route Handlers. Files written to `uploads/<idea-id>/<uuid>-<originalname>` at project root. Served via auth-gated Route Handler (not `public/`).

**Rationale**: No extra upload middleware needed. Storing outside `public/` is a constitution security requirement. UUID prefix in filename prevents collisions and path traversal via `..` in original filename.

**Alternatives considered**:

- `multer` — works only in Pages Router (not App Router); not needed.
- `busboy` directly — more complex; native `formData()` is sufficient for ≤ 10 MB files.

**Outcome**: Server-side MIME type validation via `mimetype` header (not file extension); size capped at 10 MB; allowed types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX), `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX), `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX), `image/png`, `image/jpeg`, `image/gif`, `video/mp4`.

---

### 8. ID Generation — `uuid` v4

**Decision**: `uuid` package, `v4()` for all primary keys (users, ideas, attachments, evaluations).

**Rationale**: UUID v4 is random, collision-resistant, and avoids sequential integer IDs that leak record count information. `uuid` is on the permitted list.

**Alternatives considered**:

- `crypto.randomUUID()` (Node built-in) — available in Node 15.6+; would eliminate the `uuid` dependency. However, `uuid` is already on the permitted list and provides a more ergonomic API.

**Outcome**: Use `import { v4 as uuidv4 } from 'uuid'` throughout.

---

### 9. Input Validation — Zod

**Decision**: Zod v3 for all API boundary validation. Schemas in `src/lib/validations.ts`, shared between Server Action/Route Handler and client-side `react-hook-form` resolver.

**Rationale**: Constitution Principle IV mandates Zod. Dual-use (client + server) from a single schema source eliminates duplication. `zodResolver` from `@hookform/resolvers` bridges `react-hook-form` and Zod with no extra code.

**Schemas needed**:

- `RegisterSchema` — `{ name, email, password }`
- `LoginSchema` — `{ email, password }`
- `IdeaSchema` — `{ title, description, category, categoryMetadata? }`
- `EvaluationSchema` — `{ decision, notes? }`

**Outcome**: All four schemas in `src/lib/validations.ts`.

---

## All Unknowns Resolved

| Unknown              | Resolution                             |
| -------------------- | -------------------------------------- |
| Theme token storage  | `globals.css` `@theme` block           |
| DB driver            | `better-sqlite3` synchronous singleton |
| UI component library | shadcn/ui New York, CSS variables      |
| Date format          | `date-fns` `format()` wrappers         |
| Auth mechanism       | NextAuth v5 Credentials + JWT          |
| File storage         | `uploads/` at project root             |
| ID generation        | `uuid` v4                              |
| Validation           | Zod schemas in `validations.ts`        |
| Tests                | None — manual walkthrough only         |
