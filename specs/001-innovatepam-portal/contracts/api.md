# API Contract: InnovatEPAM Portal

**Branch**: `001-innovatepam-portal` | **Phase**: 1 — Design

Base URL (local dev): `http://localhost:3000`

All endpoints require `Content-Type: application/json` except file upload endpoints.
All protected endpoints require a valid NextAuth session cookie (`next-auth.session-token`).
All error responses follow the shape: `{ "error": "<message>" }`.

---

## Authentication

### POST `/api/users` — Register

Creates a new account with role `submitter`.

**Auth**: Public (no session required)

**Request body**:

```json
{
  "name": "Alice Smith",
  "email": "alice@epam.com",
  "password": "Test1234!"
}
```

**Validation** (`RegisterSchema`):

- `name`: string, 1–100 characters
- `email`: valid email format
- `password`: string, minimum 8 characters

**Responses**:

| Status | Body                                                                                        | Condition            |
| ------ | ------------------------------------------------------------------------------------------- | -------------------- |
| 201    | `{ "id": "<uuid>", "name": "Alice Smith", "email": "alice@epam.com", "role": "submitter" }` | Created              |
| 400    | `{ "error": "Validation failed", "details": [...] }`                                        | Zod validation error |
| 409    | `{ "error": "Email already in use" }`                                                       | Duplicate email      |
| 500    | `{ "error": "Internal server error" }`                                                      | DB failure           |

---

### POST `/api/auth/callback/credentials` — Login (NextAuth)

Handled by NextAuth. Accepts `email` + `password` via form POST. On success, sets a JWT session cookie. Redirects to role destination on success (`/dashboard` or `/admin`).

---

## Ideas

### GET `/api/ideas` — List Ideas

Returns ideas visible to the current user.

**Auth**: Required (any authenticated user)

**Query parameters**:

- `status` (optional): filter by status value (`submitted` | `under_review` | `accepted` | `rejected` | `draft`)

**Behaviour**:

- `submitter`: returns only ideas where `submitter_id === session.user.id`. Never returns `draft` ideas in the main list (drafts served separately).
- `admin`: returns all ideas with `status != 'draft'`.

**Response 200**:

```json
[
  {
    "id": "uuid",
    "title": "AI-powered code review tool",
    "category": "Technical",
    "status": "submitted",
    "submitterName": "Alice Smith",
    "createdAt": "2026-05-13T10:00:00.000Z",
    "updatedAt": "2026-05-13T10:00:00.000Z"
  }
]
```

| Status | Condition                    |
| ------ | ---------------------------- |
| 200    | Success (may be empty array) |
| 401    | No session                   |
| 500    | DB failure                   |

---

### POST `/api/ideas` — Create Idea

Creates a new idea. Defaults to status `submitted`; pass `?draft=true` to save as draft.

**Auth**: Required (any authenticated user — submitters and admins, per CL-013)

**Query parameters**:

- `draft` (optional): `"true"` to save with status `draft`

**Request body**:

```json
{
  "title": "AI-powered code review tool",
  "description": "Use LLMs to flag anti-patterns during pull request review.",
  "category": "Technical",
  "categoryMetadata": null
}
```

**Validation** (`IdeaSchema`):

- `title`: string, 1–100 characters
- `description`: string, 1–2000 characters
- `category`: one of `Technical` | `Process Improvement` | `Client Solutions` | `Cost Reduction` | `Employee Experience`
- `categoryMetadata`: optional object (Phase 5)

**Responses**:

| Status | Body                                                             | Condition  |
| ------ | ---------------------------------------------------------------- | ---------- |
| 201    | `{ "id": "<uuid>", "title": "...", "status": "submitted", ... }` | Created    |
| 400    | `{ "error": "Validation failed", "details": [...] }`             | Zod error  |
| 401    | `{ "error": "Unauthorized" }`                                    | No session |
| 500    | `{ "error": "Internal server error" }`                           | DB failure |

---

### GET `/api/ideas/[id]` — Get Idea Detail

Returns full idea with evaluation and attachments.

**Auth**: Required

**Access rules**:

- Submitter: may only fetch their own ideas. Draft ideas accessible to owner.
- Admin: may fetch any idea except draft ideas (returns 403 for drafts per CL-010).

**Response 200**:

```json
{
  "id": "uuid",
  "title": "AI-powered code review tool",
  "description": "Use LLMs to flag anti-patterns...",
  "category": "Technical",
  "status": "accepted",
  "categoryMetadata": null,
  "submitterId": "uuid",
  "submitterName": "Alice Smith",
  "createdAt": "2026-05-13T10:00:00.000Z",
  "updatedAt": "2026-05-13T11:00:00.000Z",
  "evaluation": {
    "decision": "accepted",
    "notes": "Strong ROI potential.",
    "evaluatorName": "Admin User",
    "updatedAt": "2026-05-13T11:00:00.000Z"
  },
  "attachments": [
    {
      "id": "uuid",
      "filename": "proposal.pdf",
      "mimetype": "application/pdf",
      "size": 204800
    }
  ]
}
```

| Status | Condition                                                           |
| ------ | ------------------------------------------------------------------- |
| 200    | Success                                                             |
| 401    | No session                                                          |
| 403    | Submitter accessing another user's idea; or admin accessing a draft |
| 404    | Idea not found                                                      |
| 500    | DB failure                                                          |

---

### PATCH `/api/ideas/[id]` — Update Draft

Updates a `draft` idea. Only the owner may call this endpoint.

**Auth**: Required (owner only)

**Request body** (all fields optional):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Process Improvement",
  "categoryMetadata": {
    "affectedDepartment": "Engineering",
    "estimatedTimeSaving": "2h/week"
  }
}
```

| Status | Condition                                                |
| ------ | -------------------------------------------------------- |
| 200    | `{ "id": "...", "status": "draft", ... }` — updated idea |
| 400    | Validation error                                         |
| 401    | No session                                               |
| 403    | Not owner, or idea is not in `draft` status              |
| 404    | Idea not found                                           |
| 500    | DB failure                                               |

---

## Evaluations

### POST `/api/ideas/[id]/evaluate` — Evaluate Idea

Upserts an evaluation and updates the idea's status atomically. Admin only.

**Auth**: Required (`role === 'admin'`)

**Request body**:

```json
{
  "decision": "accepted",
  "notes": "Strong ROI potential. Approved for Phase 1 funding."
}
```

**Validation** (`EvaluationSchema`):

- `decision`: one of `under_review` | `accepted` | `rejected` (required)
- `notes`: string (optional)

**Behaviour**: UPSERTs the `evaluations` row (INSERT OR REPLACE). Updates `ideas.status` to `decision` value in the same DB transaction. Updates `ideas.updated_at`.

**Responses**:

| Status | Body                                                          | Condition                    |
| ------ | ------------------------------------------------------------- | ---------------------------- |
| 200    | `{ "ideaId": "...", "decision": "accepted", "notes": "..." }` | Success (created or updated) |
| 400    | `{ "error": "Validation failed", "details": [...] }`          | Zod error                    |
| 401    | `{ "error": "Unauthorized" }`                                 | No session                   |
| 403    | `{ "error": "Forbidden" }`                                    | Not admin                    |
| 404    | `{ "error": "Idea not found" }`                               | No such idea                 |
| 500    | `{ "error": "Internal server error" }`                        | DB failure                   |

---

## Attachments

### POST `/api/ideas/[id]/attachments` — Upload Attachment

Uploads a file and links it to the idea.

**Auth**: Required (owner or admin)

**Content-Type**: `multipart/form-data`

**Form fields**:

- `file`: the file binary

**Server-side validation**:

- MIME type must match the allowlist (see data-model)
- Size ≤ 10 MB (10,485,760 bytes)
- Phase 1: only 1 attachment per idea; Phase 6+: up to 5

**Response 201**:

```json
{
  "id": "uuid",
  "filename": "proposal.pdf",
  "mimetype": "application/pdf",
  "size": 204800
}
```

| Status | Condition                                                  |
| ------ | ---------------------------------------------------------- |
| 201    | Uploaded                                                   |
| 400    | MIME type not allowed / size exceeded / missing file field |
| 401    | No session                                                 |
| 403    | Not owner or admin                                         |
| 404    | Idea not found                                             |
| 500    | Disk write failure or DB failure                           |

---

### GET `/api/ideas/[id]/attachments/[attachmentId]` — Download Attachment

Streams the file to the authenticated caller.

**Auth**: Required (owner or admin — CL-007)

**Response**:

- `200`: file bytes with `Content-Type` and `Content-Disposition: attachment; filename="<name>"`
- `401`: No session
- `403`: Not owner or admin
- `404`: Attachment or idea not found

---

## Error Response Shape

All non-2xx responses return:

```json
{
  "error": "Human-readable message",
  "details": [ ... ]   // optional; present on Zod validation failures
}
```

Stack traces are never included in responses.

---

## Authentication Cookie

NextAuth sets `next-auth.session-token` (HttpOnly, SameSite=Lax). The token is a signed JWT containing:

```json
{
  "id": "user-uuid",
  "name": "Alice Smith",
  "email": "alice@epam.com",
  "role": "submitter",
  "exp": 1747400000
}
```

Expiry: 24 hours from issuance (CL-012).
