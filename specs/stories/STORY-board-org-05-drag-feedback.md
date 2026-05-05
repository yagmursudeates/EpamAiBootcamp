# User Story: Visual Feedback During Drag and Drop

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-board-org-05
- Title: Visual Feedback During Drag and Drop

---

## 2. User Story

As a Solo Developer, I want clear visual feedback when dragging tasks, so that I know where I can drop them.

- Persona: Solo Developer
- Context / Preconditions: Task board is visible; user is dragging a task

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN a task is being dragged, WHEN the user inspects the dragged task card, THEN the card shows a visual change (opacity, shadow, border, or scale) indicating it is being dragged.
2. AC-2: GIVEN a task is dragged over a column, WHEN the task enters the column's drop zone, THEN the column highlights (background color change, border highlight, or glow effect).
3. AC-3: GIVEN a task is over a valid drop column, WHEN the user inspects the cursor, THEN the cursor changes to indicate a droppable area (e.g., "grab", "copy", or CSS cursor change).
4. AC-4: GIVEN a task leaves a column, WHEN the task moves out of the column, THEN the highlight immediately disappears from that column.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Add CSS classes or inline styles during drag events (dragstart, dragover, dragleave, drop)
  - Use CSS transitions for smooth visual changes (not jarring)
  - Cursor: use CSS `cursor: grab` on draggable, `cursor: grabbing` during drag

- Data model changes:
  - Optional: track "isDragging" state for styling

- Testing notes:
  - Visual regression test: Drag state appearance matches design
  - Functional test: Highlight appears on dragover, disappears on dragleave
  - Cross-browser test: Cursor and visual feedback work on Chrome, Firefox, Safari

---

## 5. Estimation

- Estimate: 2 story points (or 0.5 day)
- Confidence: HIGH
- Assumptions used for estimate: CSS styling language chosen; no complex animations

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on drag-drop implementation (Story 02)
- **Negotiable:** YES — Visual styling, colors, animation timing negotiable
- **Valuable:** YES — Improves UX by clarifying drag targets
- **Estimable:** YES — Styling addition; 0.5 day estimate
- **Small:** YES — Visual feedback only; completable within sprint
- **Testable:** YES — Visual state changes measurable (CSS classes, element visibility)

---

## Appendix / Links

- Related tickets: STORY-board-org-02 (Drag and Drop)
- Notes: Animation timing should be fast (< 200ms) to feel responsive
