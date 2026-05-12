# speckit-lab Constitution

## Core Principles

### I. Clean Code

Every module must be readable, maintainable, and purposeful. Functions do one thing; names are self-documenting; no dead code or commented-out blocks. Complexity must be justified — prefer simplicity and YAGNI.

### II. TypeScript Strict Mode (NON-NEGOTIABLE)

All source files must be TypeScript. The `strict` compiler flag is enabled at all times. This includes `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and `strictPropertyInitialization`. No use of `any` unless explicitly justified with an inline comment.

### III. JSDoc Documentation (NON-NEGOTIABLE)

All exported functions, classes, interfaces, and types must have JSDoc comments. Comments must describe purpose, parameters (`@param`), return values (`@returns`), and thrown errors (`@throws`) where applicable. Inline comments are required for non-obvious logic.

### IV. Testing Pyramid with 80% Coverage

Testing follows the Testing Pyramid: unit tests form the base, integration tests the middle, and end-to-end tests the apex. Business logic must achieve a minimum of **80% code coverage**. TDD is strongly encouraged: write tests before implementation, follow Red-Green-Refactor.

### V. Simplicity

Start simple. No over-engineering. Abstractions are introduced only when duplication appears at least twice or complexity demands it. Each change must have a clear, demonstrable purpose.

## Technology Standards

- **Language**: TypeScript (strict mode)
- **Testing Framework**: Jest (or Vitest) with coverage reporting enabled
- **Coverage Threshold**: 80% on lines, branches, and functions for business logic modules
- **Documentation**: JSDoc on all public APIs
- **Linting**: ESLint with TypeScript rules enforced in CI

## Development Workflow

- All code is reviewed before merging; PRs must include passing tests and coverage report
- Failing tests block merges — no exceptions
- Constitution compliance is verified in every code review
- Breaking changes require explicit documentation and a migration path

## Governance

This Constitution supersedes all other practices. Amendments require team consensus, documentation of rationale, and a migration plan for existing code.

**Version**: 1.0.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
