# ADR-001: Testing Strategy — Vitest + React Testing Library

**Date**: 2026-05-14  
**Status**: Accepted  
**Deciders**: Engineering team

---

## Context

The original constitution marked testing as "Manual walkthrough against Given/When/Then scenarios." The team has since adopted a TDD workflow requiring automated tests at each implementation step.

## Decision

Use **Vitest** + **React Testing Library (RTL)** for unit and integration tests.

### Rationale

| Option     | Pro                               | Con                                          | Decision                |
| ---------- | --------------------------------- | -------------------------------------------- | ----------------------- |
| Jest       | Widely used                       | Requires extra config for ESM/TSX in Next.js | ✗                       |
| Vitest     | Native ESM, Vite-compatible, fast | Slightly newer                               | ✓                       |
| Playwright | True E2E, browser-based           | Slower, requires running server              | Deferred to Phase 2 E2E |

### Test layers

| Layer             | Tool         | What is tested                                 |
| ----------------- | ------------ | ---------------------------------------------- |
| Unit              | Vitest       | Pure functions: Zod schemas, utils, formatters |
| Component         | Vitest + RTL | UI components: StatusBadge, IdeaCard, forms    |
| Integration (API) | Vitest       | API route handlers called directly (no HTTP)   |

### Constraints

- Tests run with `npm test` (Vitest watch) and `npm run test:ci` (single pass)
- DB interactions in API tests use an **in-memory SQLite** instance (not the real file)
- NextAuth session is **mocked** in all component and API tests
- No E2E tests in this phase (deferred to Playwright in Phase 2)

## Consequences

- Add `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` as dev dependencies
- Add `vitest.config.ts` at app root
- Tests live in `src/__tests__/` (unit/integration) and co-located `*.test.tsx` for components
- Update constitution testing section to reflect this decision
