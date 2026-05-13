# Task Board — Build Output (without memory)

Date: 2026-05-13

## Summary

A lightweight, frontend-only personal task board was scaffolded and built from scratch based on the PRD at `specs/prds/prd-personal-task-board.md`.

The app is running at **http://localhost:5175/**

---

## Tech Stack

| Layer              | Technology                        |
| ------------------ | --------------------------------- |
| Frontend Framework | React 18                          |
| Build Tool         | Vite                              |
| Language           | TypeScript                        |
| Drag & Drop        | @dnd-kit/core + @dnd-kit/sortable |
| Styling            | CSS Modules                       |
| Persistence        | Browser localStorage (JSON)       |
| Backend            | None                              |

---

## File Structure Created

```
src/
  types.ts                          — Task, Project, ColumnId types + constants
  utils/
    generateId.ts                   — Collision-safe ID generator
  services/
    persistenceService.ts           — localStorage load/save with QuotaExceededError handling
  state/
    boardReducer.ts                 — useReducer actions (create/edit/delete/move/reorder tasks & projects)
    BoardContext.tsx                — React Context provider + useBoard() hook
  hooks/
    useKeyboardShortcuts.ts         — Ctrl+N (create), Alt+→/← (move focused task), ? (help)
  components/
    Board.tsx / Board.module.css               — DndContext + 3-column responsive grid
    BoardColumn.tsx / BoardColumn.module.css   — Droppable column with task list + count badge
    TaskCard.tsx / TaskCard.module.css         — Sortable draggable card with edit/delete
    TaskDialog.tsx / TaskDialog.module.css     — Create/edit modal with validation
    ProjectSelector.tsx / ProjectSelector.module.css  — Project switcher + create/delete
    HelpOverlay.tsx / HelpOverlay.module.css   — Keyboard shortcuts table + usage guide
  App.tsx / App.module.css          — Sticky header shell, error banner, modal orchestration
  index.css                         — Global box-sizing + font reset
  main.tsx                          — React root (unchanged from scaffold)
```

---

## Features Delivered

### Core Task Management

- Create tasks with title (required, ≤200 chars) + optional description (≤2000 chars)
- Edit task title and description via ✏️ button
- Delete task with confirmation via 🗑️ button
- Input validation with accessible error messages (`role="alert"`)

### Board Organisation

- Three-column Kanban board: **To Do** / **In Progress** / **Done**
- Per-column task count badge
- Drag-and-drop reordering within a column and between columns (`@dnd-kit`)
- Drag activation threshold (5 px) prevents accidental drags on click

### Keyboard Shortcuts

| Keys              | Action                                   |
| ----------------- | ---------------------------------------- |
| `Ctrl+N`          | Open "New Task" dialog                   |
| `Alt+→`           | Move focused task to the next column     |
| `Alt+←`           | Move focused task to the previous column |
| `?`               | Toggle help overlay                      |
| `Esc`             | Close dialog / cancel                    |
| `Tab / Shift+Tab` | Navigate all interactive elements        |

### Multi-Project Support

- Project selector dropdown in header
- Create new project (name required, ≤80 chars)
- Delete project (with all its tasks); at least one project enforced

### Persistence

- All state auto-saved to `localStorage` key `taskboard-projects` on every mutation
- State restored on page load; versioned JSON schema (v1)
- `QuotaExceededError` caught and surfaced as a dismissible error banner

### Accessibility

- Semantic HTML (`<header>`, `<main>`, `<section>`, `<article>`)
- ARIA labels on all interactive elements
- Visible focus rings on all focusable elements (`:focus-visible`)
- Dialog `role="dialog" aria-modal="true" aria-labelledby`
- Error messages via `role="alert"`
- Drag handle focusable via keyboard (`@dnd-kit` KeyboardSensor)

### Responsive Layout

- Three-column grid on desktop (≥769 px)
- Single-column stacked layout on mobile (≤768 px)
- Sticky header adapts with `flex-wrap`

### Help Overlay

- Keyboard shortcut reference table with `<kbd>` styling
- Basic usage guide (under 500 words)
- Accessible modal with close button and `Esc` dismissal

---

## localStorage Schema

```jsonc
// Key: "taskboard-projects"
{
  "version": 1,
  "activeProjectId": "proj-...",
  "projects": [
    { "id": "proj-...", "name": "My Project", "createdAt": "ISO8601" },
  ],
  "tasks": [
    {
      "id": "task-...",
      "title": "Set up Vite",
      "description": "",
      "column": "done", // "todo" | "inprogress" | "done"
      "order": 0,
      "projectId": "proj-...",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
    },
  ],
}
```

---

## PRD Requirements Coverage

| FR     | Description                                  | Status |
| ------ | -------------------------------------------- | ------ |
| FR-001 | Three-column Kanban board                    | ✅     |
| FR-002 | Create, edit, delete tasks                   | ✅     |
| FR-003 | Drag-and-drop task movement and reordering   | ✅     |
| FR-004 | Keyboard shortcuts for common actions        | ✅     |
| FR-005 | localStorage persistence + restore on reload | ✅     |
| FR-006 | Multi-project support with selector          | ✅     |
| FR-007 | Responsive mobile layout (320px–1920px)      | ✅     |
| FR-008 | Help section with shortcuts + usage guide    | ✅     |
| FR-009 | Keyboard navigation (Tab, focus management)  | ✅     |

---

## Out of Scope (deferred to v2 per PRD)

- Export / import task data (CSV, JSON)
- Dark mode / theme customization
- Column renaming via settings
- Visual success/spinner feedback on save (silent instant update used instead)
- Unit tests (Vitest + React Testing Library)
- CI/CD pipeline (GitHub Actions)
