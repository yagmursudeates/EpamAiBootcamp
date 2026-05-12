# Data Model: User Authentication System

**Branch**: `module_5` | **Date**: 2026-05-12

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  refreshTokens        RefreshToken[]
  passwordResetTokens  PasswordResetToken[]

  @@map("users")
}

model RefreshToken {
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  revokedAt  DateTime?
  createdAt  DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@map("refresh_tokens")
}

model PasswordResetToken {
  id         String    @id @default(uuid())
  userId     String
  tokenHash  String    @unique
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@map("password_reset_tokens")
}
```

## Entity Notes

### `users`

- `email` is stored normalised: lowercased and trimmed before insert and lookup.
- `passwordHash` stores bcrypt output (cost ≥ 12). Never returned in any API response.
- Cascade delete on `refreshTokens` and `passwordResetTokens` ensures no orphaned tokens on user deletion.

### `refresh_tokens`

- `tokenHash`: SHA-256 hex of the raw token value. Raw token only ever exists in memory and in the HTTP response body.
- `revokedAt`: set when token is rotated (on refresh), on logout, on logout-all, and on password reset.
- Reuse detection: if a request presents a token whose hash has `revokedAt IS NOT NULL`, ALL tokens for `userId` are revoked immediately (token theft signal — FR-004).
- Expired rows can be pruned by a scheduled job (not in v1 scope).

### `password_reset_tokens`

- `tokenHash`: SHA-256 hex of the raw 32-byte random token. Raw token sent once in email link.
- `usedAt`: set on successful password reset consumption. Subsequent presentations of the same token are rejected (FR-006 single-use enforcement).
- On a new password reset request, any previous unexpired token for the same user is invalidated by setting `usedAt = NOW()`.
- `expiresAt`: 15 minutes from creation (FR-006).

## Key Queries

### Register

```sql
INSERT INTO users (id, email, password_hash) VALUES ($1, lower(trim($2)), $3);
```

### Login — find user

```sql
SELECT id, password_hash FROM users WHERE email = lower(trim($1));
```

### Insert refresh token

```sql
INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
VALUES ($1, $2, $3, NOW() + INTERVAL '7 days');
```

### Rotate refresh token (transaction)

```sql
-- Step 1: find and lock current token
SELECT id, user_id, revoked_at FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE;
-- Step 2a (reuse detected): revoked_at IS NOT NULL → revoke all for user
UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $2 AND revoked_at IS NULL;
-- Step 2b (happy path): revoke current
UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1;
-- Step 3: insert new token
INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
VALUES ($3, $2, $4, NOW() + INTERVAL '7 days');
```

### Revoke all sessions (logout-all / password reset)

```sql
UPDATE refresh_tokens SET revoked_at = NOW()
WHERE user_id = $1 AND revoked_at IS NULL;
```
