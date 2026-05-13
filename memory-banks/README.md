# Memory Banks — Personal Task Board

Navigation guide for AI assistants working on the **Personal Task Board** project (React 18 + Vite + TypeScript, localStorage persistence, no backend).

---

## Directory Index

### `architecture/`

System design, tech stack decisions, component structure, data flow, and localStorage schema.

- [`overview.md`](architecture/overview.md) — High-level architecture, tech stack, and key design decisions

### `conventions/`

Coding standards, naming rules, testing patterns, and style guidelines to follow when writing or reviewing code.

- [`coding-standards.md`](conventions/coding-standards.md) — TypeScript conventions, component patterns, file naming, test structure

### `domain/`

Business terminology, rules, and personas specific to this project.

- [`glossary.md`](domain/glossary.md) — Definitions for domain terms (task, column, project, board, etc.) and user personas

### `workflows/`

Step-by-step processes for development, code review, and deployment.

- [`development-process.md`](workflows/development-process.md) — How to implement features, run tests, and ship changes

### `roles/`

Role-specific context to guide AI responses depending on the current task type.

- Developer: implementation patterns, component guidelines, localStorage API usage
- QA: acceptance criteria, testing strategies, edge cases
- PM: spec conventions, story format, prioritisation rules

---

## Quick Reference

| I need to know about…      | Go to                                   |
| -------------------------- | --------------------------------------- |
| Tech stack / architecture  | `architecture/overview.md`              |
| How to write code here     | `conventions/coding-standards.md`       |
| What a domain term means   | `domain/glossary.md`                    |
| How to implement a story   | `workflows/development-process.md`      |
| Role-specific guidance     | `roles/<role>.md`                       |
| Spec templates & structure | `../specs/templates/`                   |
| Epics & stories            | `../specs/epics/` · `../specs/stories/` |

---

> **Note for AI assistants:** Read the relevant file(s) from this bank before starting any task. Do not add backend assumptions — all persistence is via `localStorage`. Follow the naming conventions in `conventions/coding-standards.md` and the spec format defined in `../agents.md`.
