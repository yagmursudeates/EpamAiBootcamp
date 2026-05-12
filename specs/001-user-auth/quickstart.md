# Quickstart: User Authentication System

**Branch**: `module_5` | **Date**: 2026-05-12

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 15+
- `uv` (for `specify` CLI)
- `mkcert` (for local TLS — FR-014 requires HTTPS even in dev)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/authdb"
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
JWT_ALGORITHM="RS256"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="secret"
APP_BASE_URL="https://localhost:3000"
```

Generate RSA key pair:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

## 3. Set up local TLS (required by FR-014)

```bash
mkcert -install
mkcert localhost
# Outputs: localhost.pem + localhost-key.pem
```

Set in `.env`:

```env
TLS_CERT_PATH="./localhost.pem"
TLS_KEY_PATH="./localhost-key.pem"
```

## 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

## 5. Start the server

```bash
npm run dev
```

Server listens on `https://localhost:3000`.

## 6. Run tests

```bash
# All tests with coverage
npm test

# Coverage report
npm run test:coverage
```

Coverage threshold: ≥ 80% lines/branches/functions on `src/services/` (Constitution mandate).

## 7. Verify setup

```bash
# Register
curl -k -X POST https://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password1"}'

# Login
curl -k -X POST https://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password1"}'
```

## Key npm scripts

| Script                  | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start with ts-node-dev (hot reload) |
| `npm test`              | Run Jest test suite                 |
| `npm run test:coverage` | Run with coverage report            |
| `npm run lint`          | ESLint TypeScript checks            |
| `npm run build`         | Compile to `dist/`                  |
| `npx prisma studio`     | Open Prisma DB GUI                  |
