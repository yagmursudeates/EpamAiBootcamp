# Domain Glossary: Personal Task Board

Version: 1.0
Date: 2026-05-13
Source: specs/prds/prd-personal-task-board.md

---

## Task

**Definition:** The fundamental unit of work on the board. A Task has a required title, an optional description, a column assignment, and a display order within that column.

**Context:** Everything the user creates, moves, edits, and deletes is a Task. The word "card" is used interchangeably in UI copy and some spec files — always map it to `Task` in code. A Task always belongs to exactly one Project and one Column at any given time.

**Relationships:** belongs to one `Project`; lives in one `Column`; ordered relative to other Tasks in the same Column.

**Example:**

- UI label: "New Task" button, "task card"
- TypeScript type: `Task` (in `src/types/index.ts`)
- localStorage: stored in `project.tasks[]`

---

## Board

**Definition:** The visual Kanban layout displayed for a single Project, comprising all of that project's Columns and the Tasks within them.

**Context:** Users think of the Board as the primary screen. In code, the Board is not a stored entity — it is derived by rendering the active Project's columns and tasks. There is one Board visible at a time.

**Relationships:** rendered from one active `Project`; contains all `Columns` and their `Tasks`.

**Example:** "Switching the active project changes the Board displayed to the user."

---

## Column

**Definition:** A vertical swimlane on the Board representing a stage of work. The default columns are **To Do**, **In Progress**, and **Done**. Each Column has an ID, a display label, and an ordered list of Tasks.

**Context:** Columns define the workflow states a Task moves through. The three default columns are fixed for MVP. Column IDs (`todo`, `inprogress`, `done`) are used in code and localStorage; display labels may be renamed by the user (FR-001). In code the type is `ColumnId` (a string literal union).

**Relationships:** belongs to one `Project`; contains zero or more `Tasks`.

**Example:**

```typescript
type ColumnId = "todo" | "inprogress" | "done";
```

---

## Project

**Definition:** A named grouping that owns a Board, its Columns, and all associated Tasks. Users can maintain 2–3 Projects simultaneously and switch between them via the Project Selector.

**Context:** Projects provide multi-project support without a backend. Each Project is stored as a top-level entry in the localStorage JSON blob. The "active project" is the one currently shown on screen; its ID is persisted separately so it survives page reload.

**Relationships:** contains one `Board` (implicit); owns all `Columns` and `Tasks`; one Project is designated the `Active Project` at any time.

**Example:**

- "My Side Project", "Coursework", "Job Hunt" are typical project names.
- localStorage key: `taskboard-projects`; active project pointer: `taskboard-active-project`

---

## Active Project

**Definition:** The Project currently selected and displayed on the Board. Exactly one Project is active at any given time. The active project ID is persisted to localStorage so the same project reopens after a page reload.

**Context:** Used throughout the state layer to scope all reads and writes. When an AI assistant or developer refers to "the current board" or "the visible tasks", they mean those belonging to the Active Project.

**Relationships:** subset of `Project`; determines which `Board`, `Columns`, and `Tasks` are rendered.

**Example:** Switching from "My Side Project" to "Coursework" changes the Active Project; the board re-renders with Coursework's tasks; the new active ID is written to localStorage.

---

## localStorage

**Definition:** The browser's synchronous key-value storage API used as the sole persistence layer for all Projects, Columns, Tasks, and the Active Project pointer.

**Context:** This is the database for the entire application. There is no server, no cloud sync, and no external API. All reads and writes go through `persistenceService.ts`. The quota is approximately 5–10 MB per origin, which is sufficient for ~500 tasks. `QuotaExceededError` must be caught and surfaced to the user.

**Relationships:** used exclusively by `persistenceService.ts`; stores all `Project` data; never accessed directly from React components.

**Storage keys:**
| Key | Contents |
|-----|---------|
| `taskboard-projects` | Versioned JSON blob with all projects, columns, and tasks |
| `taskboard-active-project` | ID string of the currently active project |

---

## Kanban

**Definition:** A visual workflow management method that organises work items (Tasks) into columns representing stages of progress (To Do → In Progress → Done).

**Context:** This project implements a lightweight Kanban board. The term appears in the PRD, epics, and external documentation. In code and spec files, prefer "board", "column", and "task" over raw "Kanban" unless explaining the concept to a new reader.

**Relationships:** the methodology that defines the `Board`, `Column`, and `Task` concepts.

**Example:** "The Kanban board gives a visual overview of all tasks across workflow stages."

---

## Key Business Rules

### Tasks Must Have a Title

**Rule:** A Task cannot be created or saved without a non-empty title (after trimming whitespace).
**Rationale:** A titleless task is meaningless and unidentifiable in the board UI. Enforced by `validationService.ts` before any state mutation.
**Example:** Submitting the "New Task" dialog with a blank title shows the error "Task title is required." and blocks save.

---

### New Tasks Always Start in "To Do"

**Rule:** Every newly created Task is assigned to the `todo` column regardless of which column the user was viewing when they triggered creation.
**Rationale:** Consistent with standard Kanban practice; prevents accidental creation in terminal states like "Done".
**Example:** Pressing Ctrl+N while the "Done" column is focused still places the new task in "To Do".

---

### Every State Mutation Must Persist Immediately

**Rule:** Any change to Tasks, Columns, or the Active Project must be written to `localStorage` synchronously before the function returns, within the same call that updates React state.
**Rationale:** The app has no undo queue or server sync. If a write is deferred and the tab is closed, data is lost. 100% persistence across reloads is a core success metric.
**Example:** After `dispatch({ type: 'MOVE_TASK', ... })`, the reducer returns the new state and the context's effect calls `saveProjects(newState.projects)` before the next render.

---

### No Backend — localStorage Is the Only Store

**Rule:** All data is stored in browser `localStorage`. No network requests, no server-side storage, no cloud sync.
**Rationale:** Core project constraint (agents.md). Eliminates infrastructure, auth, and privacy concerns. Users are advised not to store secrets in task descriptions.
**Example:** AI assistants must not generate API calls, fetch requests, or database queries for any data-persistence feature.

---

### Maximum ~500 Tasks Per User

**Rule:** The UI must remain responsive with up to 500 Tasks across all Projects. Beyond this, consider virtualisation.
**Rationale:** localStorage quota (~5–10 MB) and rendering performance. This is a soft cap, not enforced in code for MVP, but informs component design (avoid unnecessary re-renders, avoid loading all tasks into DOM simultaneously).
**Example:** A user with 3 projects of ~165 tasks each is the expected upper bound for v1.

---

## Related Files

- [architecture/overview.md](../architecture/overview.md) — localStorage schema and component responsibilities
- [conventions/coding-standards.md](../conventions/coding-standards.md) — TypeScript type names for these terms (`Task`, `Project`, `ColumnId`, etc.)
- [specs/prds/prd-personal-task-board.md](../../specs/prds/prd-personal-task-board.md) — Full requirements and use cases
