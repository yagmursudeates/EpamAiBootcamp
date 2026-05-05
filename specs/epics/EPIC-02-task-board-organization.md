# Epic: Task Board Organization

Version: 1.0
Author / Owner: GitHub Copilot
Date: May 5, 2026

---

## 1. Epic Title

Task Board Organization — Column-Based Board & Movement

---

## 2. Description (2-3 sentences)

Create a three-column task board (To Do, In Progress, Done) and enable users to move tasks between columns via drag-and-drop and keyboard shortcuts. This epic delivers the core board layout and task state management, allowing users to visualize and organize their workflow. Success is measured by the ability to move tasks between columns in under 3 seconds with smooth visual feedback.

---

## 3. Primary Persona (who benefits most)

- Persona: **Solo Developer** — Full-stack developer managing personal projects
- Key characteristic(s): Values visual task organization and fast workflow transitions between task states

---

## 4. Success Criteria (measurable outcomes)

- SC-1: **Task Move Speed** — 95% of drag-and-drop move actions completed in under 3 seconds
- SC-2: **Column Display** — All three columns (To Do, In Progress, Done) are visible on initial board load
- SC-3: **Task Count Accuracy** — Task count on each column header is accurate and updates immediately after task move or creation
- SC-4: **Visual Feedback** — Drag-and-drop provides hover states and visual confirmation during move

---

## 5. Scope / Complexity (S/M/L estimate)

- **Estimated Size:** M (Medium)
- **Summary of included work:**
  - Three-column board layout (To Do, In Progress, Done) — responsive flexbox or grid
  - Task card components positioned in columns based on status
  - Drag-and-drop implementation (using React DnD, react-beautiful-dnd, or native HTML5 drag API)
  - Keyboard shortcuts for task movement (Alt+→, Alt+← or equivalent)
  - Task count display on each column header
  - Visual feedback during drag (hover effects, cursor changes, drop zones highlighted)
  - Column state management (which tasks belong to which column)
  - Unit and integration tests for board layout and movement logic

- **Out of scope (explicitly excluded):**
  - Custom column creation or deletion
  - Drag-and-drop animation tweening/easing
  - Column reordering or custom layout
  - Kanban-specific features (swimlanes, WIP limits)
  - Nested columns or sub-boards

---

## 6. Dependencies (what must exist first)

- **EPIC-01: Core Task Management** — Task creation and CRUD operations must exist so board has tasks to display
- **React 18 + Vite Setup** — Development environment ready; Vite configured for HMR and build
- **TypeScript Setup** — Type definitions for task state and board components
- **localStorage Persistence** — Data layer ready (can be concurrent with this epic)

---

## 7. User Stories placeholder (will be filled later)

### Example Stories (to be refined and linked to tickets):

- **Story 1: Display Three-Column Task Board**
  - As a Solo Developer, I want to see tasks organized in three columns (To Do, In Progress, Done), so that I can visualize my workflow states.
  - Acceptance Criteria:
    - AC-1: Board displays three columns with clear labels
    - AC-2: Columns are responsive and adapt to screen size
    - AC-3: Columns are visible on page load
    - AC-4: Each column has a column header showing the title
  - Estimated Size: S

- **Story 2: Move Task via Drag and Drop**
  - As a Solo Developer, I want to drag a task card to another column, so that I can quickly update task status.
  - Acceptance Criteria:
    - AC-1: Drag handle or task card itself is draggable
    - AC-2: Hover state shows drop zone is available
    - AC-3: Task moves to target column on drop
    - AC-4: Move completes in under 3 seconds
    - AC-5: Task position is preserved in new column
  - Estimated Size: M

- **Story 3: Move Task via Keyboard Shortcut**
  - As a Solo Developer, I want keyboard shortcuts to move tasks between columns, so that I can manage tasks efficiently without a mouse.
  - Acceptance Criteria:
    - AC-1: Alt+Right Arrow moves selected task to next column (e.g., To Do → In Progress)
    - AC-2: Alt+Left Arrow moves selected task to previous column (e.g., In Progress → To Do)
    - AC-3: Shortcuts only work when a task is focused/selected
    - AC-4: Shortcuts do nothing if target column doesn't exist (e.g., moving right from Done)
  - Estimated Size: M

- **Story 4: Display Task Count per Column**
  - As a Solo Developer, I want to see the number of tasks in each column, so that I can gauge workload at a glance.
  - Acceptance Criteria:
    - AC-1: Task count appears on each column header (e.g., "To Do (5)")
    - AC-2: Count updates immediately after task creation or move
    - AC-3: Count is accurate and reflects current board state
  - Estimated Size: S

- **Story 5: Visual Feedback During Drag and Drop**
  - As a Solo Developer, I want clear visual feedback when dragging tasks, so that I know where I can drop them.
  - Acceptance Criteria:
    - AC-1: Dragged task card shows opacity or shadow change
    - AC-2: Target column highlights or shows drop zone indicator on hover
    - AC-3: Drop zone feedback appears and disappears smoothly
    - AC-4: Cursor changes to indicate droppable area
  - Estimated Size: S

- **Story 6: Preserve Task Position Within Column**
  - As a Solo Developer, I want tasks to maintain their position within a column after move, so that I can organize tasks within a column.
  - Acceptance Criteria:
    - AC-1: When a task is dropped in a column, it appears at the drop location (not appended at end)
    - AC-2: Other tasks in the column shift position to accommodate the new task
  - Estimated Size: M

---

## Appendix / Notes

### Risks
- **Risk 1:** Drag-and-drop library choice impacts performance — **Mitigation:** Prototype with native HTML5 drag API first; evaluate external library (react-beautiful-dnd) if native approach is insufficient
- **Risk 2:** Keyboard shortcuts may conflict with browser defaults — **Mitigation:** Test on Chrome, Firefox, Safari; use Alt+Arrow which is typically safe

### Open Questions
- Should drag-and-drop support mobile touch devices, or is mouse/trackpad sufficient for MVP?
- Should the board support horizontal scrolling on mobile, or should columns stack vertically?

### Related PRD
- [prd-personal-task-board.md](../prds/prd-personal-task-board.md) — Full PRD context and success metrics
- Related Epics: EPIC-01 (Core Task Management), EPIC-03 (Data Persistence)
