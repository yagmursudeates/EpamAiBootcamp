# Copilot Instructions — Personal Task Board

> These instructions apply to every Copilot chat and edit in this workspace.
> See `agents.md` for the full conventions reference and `memory-banks/` for detailed role, architecture, and domain context.

---

## Project at a Glance

**Personal Task Board** — a frontend-only React 18 + Vite + TypeScript SPA. No backend, no database, no auth. All state persists in browser `localStorage` (key: `taskboard-projects`, versioned JSON).

- **Dev server:** `npm run dev` → http://localhost:5173
- **Build:** `npm run build` (runs `tsc -b && vite build`)
- **Type-check:** `node node_modules/typescript/lib/tsc.js --noEmit`
- **Spec docs:** `specs/prds/`, `specs/epics/`, `specs/stories/`

---

## Architecture

```
src/
  types.ts                  — Domain types (Task, Project, ColumnId) + constants
  utils/generateId.ts       — ID generation
  services/
    persistenceService.ts   — localStorage load/save; throws on QuotaExceededError
  state/
    boardReducer.ts         — Pure reducer + selector helpers
    BoardContext.tsx        — React Context + useBoard() hook
  hooks/
    useKeyboardShortcuts.ts — Global keyboard handler
  components/
    Board.tsx               — DnD root + column grid
    BoardColumn.tsx         — Droppable column
    TaskCard.tsx            — Sortable card
    TaskDialog.tsx          — Create/edit modal
    ProjectSelector.tsx     — Project switcher
    HelpOverlay.tsx         — Shortcut reference
```

**State flow:** component dispatches action → `boardReducer` → `BoardContext` effect → `persistenceService.saveState()`.

No Redux, no Zustand. React Context + `useReducer` only (sufficient for ≤500 tasks and 2–3 projects).

---

## Coding Conventions

Follow `memory-banks/conventions/coding-standards.md` exactly.

| Target | Convention |
|--------|-----------|
| Component files | `PascalCase.tsx` |
| Non-component TS | `camelCase.ts` |
| Custom hooks | `use` prefix, `camelCase` |
| Types / Interfaces | `PascalCase` |
| Constants | `UPPER_SNAKE_CASE` |
| CSS Modules | `kebab-case` classes, same filename as component |
| localStorage keys | `taskboard-` prefix, kebab-case |
| Event handlers | `handle` + noun + event (`handleTaskSave`) |

---

## Drag & Drop

Use `@dnd-kit/core` + `@dnd-kit/sortable`. Never use native HTML5 DnD API directly. `PointerSensor` + `KeyboardSensor` (with `sortableKeyboardCoordinates`) must always be registered together so keyboard DnD works.

---

## Persistence Rules

- Every state mutation **must** trigger `saveState(newState)` before the function returns.
- `loadState()` is called once on mount (via `useReducer` initializer).
- Catch `QuotaExceededError` in `saveState`; surface it as a dismissible UI banner — never silently swallow it.
- localStorage schema is **versioned** (`version: 1`). Add migration logic before incrementing the version.

---

## Accessibility Requirements (WCAG 2.1 AA)

Every new interactive element **must** have:
- `aria-label` or visible label text
- Visible `:focus-visible` outline (`3px solid #4f6ef7`)
- Keyboard operability (Tab, Enter/Space, Esc)
- Touch targets ≥ 44 × 44 px on mobile

Use semantic HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<dialog>`/`role="dialog"`. Never use `<div>` where a semantic element fits.

---

## Spec File Conventions (`agents.md`)

| Type | Location | Naming |
|------|----------|--------|
| PRDs | `specs/prds/` | `prd-<short-name>.md` |
| Epics | `specs/epics/` | `EPIC-NN-<short-name>.md` |
| Stories | `specs/stories/` | `STORY-<epic-short>-NN-<kebab>.md` |

Always read the matching template in `specs/templates/` before creating a new spec file.

---

## What's Out of Scope (v1)

No backend, no server-side code, no auth, no cloud sync, no multi-user, no rich text, no dark mode, no export/import, no task priorities or tags.

---

## Prompts Available

| Command | File | Purpose |
|---------|------|---------|
| `/generate-prd` | `.github/prompts/generate-prd.prompt.md` | Generate PRD from brief |
| `/decompose-epics` | `.github/prompts/decompose-epics.prompt.md` | Break PRD into Epics |
| `/decompose-stories` | `.github/prompts/decompose-stories.prompt.md` | Break Epic into Stories |
