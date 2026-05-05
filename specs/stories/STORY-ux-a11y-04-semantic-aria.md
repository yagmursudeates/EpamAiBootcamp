# User Story: Add Accessible Semantic HTML and ARIA Labels

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-ux-a11y-04
- Title: Add Accessible Semantic HTML and ARIA Labels

---

## 2. User Story

As a Student Developer using a screen reader, I want proper semantic HTML and ARIA labels, so that the board is usable with assistive technology.

- Persona: Student Developer
- Context / Preconditions: User is accessing the app with a screen reader (NVDA, JAWS, VoiceOver)

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN form inputs exist, WHEN the screen reader reads the page, THEN each input has an associated `<label>` element with proper `for` attribute linking to the input.
2. AC-2: GIVEN buttons exist, WHEN the screen reader encounters them, THEN buttons have descriptive text (e.g., "Delete task" not just "X" or "...").
3. AC-3: GIVEN column headers exist, WHEN the screen reader reads them, THEN headers use semantic `<h2>` or `<h3>` elements (not `<div>`).
4. AC-4: GIVEN tasks are listed, WHEN the screen reader reads the list, THEN the task list uses `<ul>` or `<ol>` with `<li>` elements (or `role="list"`).
5. AC-5: GIVEN modals or dialogs open, WHEN the screen reader reads them, THEN modals have `role="dialog"`, proper focus trapping (focus doesn't escape), and close button with clear label.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Use semantic HTML elements: <button>, <a>, <form>, <input>, <label>, <h1>-<h6>, <ul>, <li>
  - Add ARIA attributes where semantic HTML is insufficient:
    - `aria-label` for icon buttons
    - `aria-labelledby` for form groups
    - `role="list"` for custom lists
    - `role="dialog"`, `aria-modal="true"` for modals
  - Implement focus trapping in modals (Tab cycles within modal only)

- Testing tools:
  - axe DevTools (automated accessibility audit)
  - NVDA or JAWS (screen reader testing)
  - Lighthouse accessibility audit

- Testing notes:
  - Automated test: aXe audit for ARIA/semantic issues
  - Manual test: Navigate with screen reader; verify labels, headings, lists readable
  - Keyboard test: Tab order within modals; verify focus trapping

---

## 5. Estimation

- Estimate: 4 story points (or 1.5 days)
- Confidence: MEDIUM
- Assumptions used for estimate: Screen reader testing needed; ARIA patterns documented

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on UI component structure (all epics); accessibility layer
- **Negotiable:** YES — ARIA implementation details negotiable (labels vs labelledby, etc.)
- **Valuable:** YES — Essential for WCAG AA compliance; enables screen reader users
- **Estimable:** YES — Semantic HTML and ARIA patterns defined; 1.5 day estimate
- **Small:** YES — HTML markup and ARIA attributes; completable within sprint
- **Testable:** YES — Semantic elements verified, ARIA attributes confirmed, screen reader testing

---

## Appendix / Links

- Related tickets: EPIC-04-ux-accessibility.md, STORY-ux-a11y-07 (Full Accessibility Test)
- Notes: Focus trapping in modals critical for accessibility
