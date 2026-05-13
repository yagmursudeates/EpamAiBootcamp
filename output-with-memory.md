# Task Board — Build Output (with workspace memory)

Date: 2026-05-13

## What "with memory" means

This run used the full workspace context defined in:

| Source | What it provides |
|--------|-----------------|
| `agents.md` | Tech stack constraints, spec file naming conventions, AI assistant guidance |
| `memory-banks/architecture/overview.md` | System architecture, localStorage schema, DnD library choice, state management decision |
| `memory-banks/conventions/coding-standards.md` | File/symbol naming tables, CSS Modules conventions, event handler patterns |
| `memory-banks/roles/developer.md` | Per-story implementation checklist, code placement rules, key patterns (Result type, reducer actions) |
| `memory-banks/workflows/development-process.md` | Story → branch → implement → test → PR → deploy workflow |
| `.github/prompts/generate-prd.prompt.md` | PRD generation instructions and quality checklist |
| `.github/prompts/decompose-epics.prompt.md` | Epic decomposition instructions (3–4 epics, INVEST, Success Metric mapping) |
| `.github/prompts/decompose-stories.prompt.md` | Story decomposition instructions (5–7 stories, GIVEN/WHEN/THEN ACs) |
| `.github/copilot-instructions.md` (**created this run**) | Always-on Copilot agent instructions distilled from all of the above |

Without this context, the previous run (`output-without-memory.md`) still produced working code, but required re-reading all the architecture docs from scratch and had no persistent instruction file to guide future sessions.

---

## App Summary

Running at **http://localhost:5175/** · Production build: `dist/` (252 KB JS, 9.6 KB CSS)

**Stack:** React 18 + Vite + TypeScript · `@dnd-kit/core` + `@dnd-kit/sortable` · CSS Modules · `localStorage` persistence

---

## Source Files

```
src/
  types.ts                                    Domain types: Task, Project, ColumnId; constants
  utils/generateId.ts                         Collision-safe ID generator
  services/persistenceService.ts             localStorage load/save with QuotaExceededError surfacing
  state/
    boardReducer.ts                           Pure reducer + getTasksForColumn / getColumnTaskCount helpers
    BoardContext.tsx                          React Context + useBoard() hook; auto-saves on every state change
  hooks/
    useKeyboardShortcuts.ts                   Ctrl+N, Alt+→/←, ? — bound globally via window.addEventListener
  components/
    Board.tsx + Board.module.css              DndContext (PointerSensor + KeyboardSensor) + 3-col responsive grid
    BoardColumn.tsx + BoardColumn.module.css  useDroppable column, SortableContext, task count badge
    TaskCard.tsx + TaskCard.module.css        useSortable card, data-task-id for keyboard move, tabIndex=0
    TaskDialog.tsx + TaskDialog.module.css    Create/edit modal — validation, role=dialog, aria-modal, autoFocus
    ProjectSelector.tsx + ProjectSelector.module.css  Project CRUD; enforces ≥1 project
    HelpOverlay.tsx + HelpOverlay.module.css  Shortcut table (<kbd>), usage guide <500 words, Esc to close
  App.tsx + App.module.css                   Sticky header, error banner, Ctrl+N / ? dispatch to dialogs
  index.css                                   Global box-sizing + font reset
  main.tsx                                    StrictMode React root (unmodified from scaffold)
```

---

## Architecture Decisions (from `memory-banks/architecture/overview.md`)

| Decision | Choice | Reason |
|----------|--------|--------|
| State management | React Context + useReducer | No Redux/Zustand; sufficient for ≤500 tasks, 2–3 projects |
| Drag & drop | `@dnd-kit/core` | Accessible keyboard DnD, touch support, tree-shakeable |
| Styling | CSS Modules | No runtime CSS-in-JS; lean bundle |
| Persistence | Versioned JSON in localStorage | Single key `taskboard-projects`, schema `version: 1` |
| Backend | None | Frontend-only per PRD constraint |

---

## localStorage Schema (`version: 1`)

```jsonc
{
  "version": 1,
  "activeProjectId": "proj-...",
  "projects": [
    { "id": "proj-...", "name": "My Project", "createdAt": "ISO8601" }
  ],
  "tasks": [
    {
      "id": "task-...",
      "title": "Set up Vite",
      "description": "",
      "column": "done",        // "todo" | "inprogress" | "done"
      "order": 0,
      "projectId": "proj-...",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

---

## Keyboard Shortcuts

| Keys | Action |
|------|--------|
| `Ctrl+N` | Open "New Task" dialog |
| `Alt+→` | Move focused task to the next column |
| `Alt+←` | Move focused task to the previous column |
| `?` | Toggle help overlay |
| `Esc` | Close dialog / cancel |
| `Tab / Shift+Tab` | Navigate all interactive elements |

---

## PRD Requirements Coverage

| FR | Description | Status |
|----|-------------|--------|
| FR-001 | Three-column Kanban board (To Do / In Progress / Done) | ✅ |
| FR-002 | Create, edit, delete tasks with title + description | ✅ |
| FR-003 | Drag-and-drop movement and reordering | ✅ |
| FR-004 | Keyboard shortcuts for common actions | ✅ |
| FR-005 | localStorage persistence + restore on reload | ✅ |
| FR-006 | Multi-project support with project selector | ✅ |
| FR-007 | Responsive mobile layout (320px–1920px) | ✅ |
| FR-008 | Help section with shortcuts + usage guide | ✅ |
| FR-009 | Keyboard navigation (Tab, focus management) | ✅ |

---

## What Was Created in This Run

Beyond the app itself (already built), this run added:

### `.github/copilot-instructions.md` (new)
An always-on Copilot agent instructions file distilled from the workspace memory banks. Every future Copilot chat in this workspace will automatically have:
- Project architecture overview and state flow
- Naming convention tables
- DnD and persistence rules
- Accessibility requirements checklist
- Out-of-scope list (prevents scope creep)
- Available slash-command prompts (`/generate-prd`, `/decompose-epics`, `/decompose-stories`)

---

## Difference: Without Memory vs With Memory

| Aspect | Without Memory (`output-without-memory.md`) | With Memory (this run) |
|--------|---------------------------------------------|------------------------|
| Context source | Read docs ad hoc during build | Workspace memory banks + prompt conventions pre-loaded |
| Persistent instructions | None — context lost after session | `.github/copilot-instructions.md` always loaded by Copilot |
| Naming consistency | Applied from docs read in session | Enforced by instructions file in every future session |
| Slash commands | Available but not documented | Documented in instructions file |
| Future sessions | Must re-read all docs from scratch | Context injected automatically via `copilot-instructions.md` |
| App correctness | Identical (same code, same build) | Identical |
