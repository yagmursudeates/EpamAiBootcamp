# User Story: Preserve Task Position Within Column

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-board-org-06
- Title: Preserve Task Position Within Column

---

## 2. User Story

As a Solo Developer, I want tasks to maintain their position within a column after move, so that I can organize tasks within a column.

- Persona: Solo Developer
- Context / Preconditions: Multiple tasks exist in a column; user is reordering tasks

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN multiple tasks exist in a column, WHEN a task is dragged and dropped at a specific position within the column, THEN the task appears at the drop location (not appended at the end).
2. AC-2: GIVEN a task is dropped between two existing tasks, WHEN the drop completes, THEN the other tasks in the column shift position to accommodate the new task order.
3. AC-3: GIVEN tasks are reordered within a column, WHEN the page is refreshed, THEN the task order is preserved (persisted to storage).
4. AC-4: GIVEN a task is dropped at the top of a column, WHEN the drop completes, THEN the task appears first in that column.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Track task order within each column (e.g., array index or explicit order field)
  - On drop, recalculate order based on drop position
  - Use `insertBefore` or array splice to update task order

- Data model changes:
  - Add optional `order` or `position` field to Task object (or manage order via array position)
  - Persist task order to localStorage along with status

- Testing notes:
  - Functional test: Task drops at correct position within column
  - Integration test: Task order persists after page reload
  - Edge case: Drop at top, middle, bottom of column

---

## 5. Estimation

- Estimate: 3 story points (or 1 day)
- Confidence: MEDIUM
- Assumptions used for estimate: Drag-drop library supports position tracking; order persistence straightforward

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on drag-drop (Story 02) and persistence
- **Negotiable:** YES — Order tracking mechanism (array index vs explicit field) negotiable
- **Valuable:** YES — Enables prioritization/organization within columns
- **Estimable:** YES — Scope is clear; 1 day estimate
- **Small:** YES — Order management logic; completable within sprint
- **Testable:** YES — Task position accuracy, persistence measurable

---

## Appendix / Links

- Related tickets: STORY-board-org-02 (Drag and Drop), STORY-persistence-01 (Persistence)
- Notes: Order persistence requires coordination with EPIC-03 (Data Persistence)
