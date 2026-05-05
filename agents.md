# Agents Conventions for Task Board Project

Purpose: concise conventions for humans and AI assistants to follow when working on specs and features.

1. Tech Stack
- Frontend: React 18 + Vite
- Language: TypeScript
- Persistence: browser localStorage only (no backend or server-side storage)
- Build/run: npm / pnpm scripts as defined in package.json

2. Specification Structure
- Templates: specs/templates/ (prd-template.md, epic-template.md, story-template.md)
- PRDs: specs/prds/ — final PRD files (use prd-<short-name>.md)
- Epics: specs/epics/ — epic-<short-name>.md
- Stories: specs/stories/ — story-<ticket-id|short-name>.md

3. Naming Conventions
- File names: kebab-case, lowercase. Prefix with type: prd-, epic-, story-.
- Include ticket ID when available: story-project-123.md
- Headers: include Version, Author, Date in the top of each spec file.
- Use [BRACKETED] placeholders in templates for human authors.

4. File Organization
- Root: /specs/
  - /specs/templates/  (markdown templates)
  - /specs/prds/       (completed PRDs)
  - /specs/epics/      (epic documents)
  - /specs/stories/    (user stories)
  - /specs/assets/     (images, wireframes)

Guidance for AI assistants
- Always read the appropriate template in specs/templates/ before creating a new spec.
- Follow naming conventions and include header metadata (Version, Author, Date).
- Link related files using relative paths and include ticket IDs where applicable.
- Do not add backend assumptions; persist feature state to localStorage unless user requests a backend.
- Keep docs concise; prefer actionable, testable acceptance criteria.

Appendix
- Update this agents.md if conventions change. Commit messages for spec changes should reference the spec path.

