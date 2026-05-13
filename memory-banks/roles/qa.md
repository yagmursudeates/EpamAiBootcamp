# Role Context: QA — Personal Task Board

Version: 1.0
Date: 2026-05-13

---

## Your Role

You are verifying that features meet acceptance criteria and that the app is reliable, accessible, and performant. This is a **frontend-only SPA** — there is no backend or network layer to test. All data lives in browser `localStorage`. Your test surface is: the React UI, keyboard interactions, localStorage persistence, and WCAG 2.1 AA compliance.

---

## Before You Test a Story

1. Read the story: `specs/stories/STORY-<id>.md` — each acceptance criterion is a test case.
2. Read `memory-banks/domain/glossary.md` — use correct terms in bug reports.
3. Read the relevant functional requirement in `specs/prds/prd-personal-task-board.md`.

---

## Test Types and When to Use Them

| Type                | Tool                           | When                                                       |
| ------------------- | ------------------------------ | ---------------------------------------------------------- |
| Unit                | Vitest                         | Service functions, reducers, utils — run by developer      |
| Integration         | Vitest + React Testing Library | Component flows with user events — run by developer and CI |
| Manual functional   | Browser                        | Acceptance criteria verification per story                 |
| Accessibility audit | axe DevTools / Lighthouse      | Every PR that changes UI                                   |
| Manual keyboard     | Browser (no mouse)             | Every interactive feature                                  |
| Persistence check   | Browser (manual)               | Every feature that reads/writes localStorage               |

---

## Manual Test Checklist (per story)

### Functional

- [ ] All acceptance criteria in the story are satisfied
- [ ] Happy path works as described in the story's Main Flow
- [ ] Alternative / error flows work (e.g., empty title shows validation error)
- [ ] Edge cases covered: empty state, maximum content length, duplicate names

### Persistence

- [ ] After completing the action, **reload the page** — data must be restored exactly
- [ ] Open a new tab to the same URL — data must be consistent
- [ ] Perform the action, close the tab, reopen — data must survive

### Keyboard / Accessibility

- [ ] Complete the entire flow using keyboard only (no mouse)
- [ ] Tab order is logical; focus never gets trapped unexpectedly
- [ ] Focus returns to the correct element after a dialog closes
- [ ] All interactive elements have visible focus indicators
- [ ] All images/icons have alt text or `aria-hidden`
- [ ] Form fields have associated labels (not just placeholder text)
- [ ] Error messages are announced (use `role="alert"` or `aria-live`)
- [ ] axe DevTools reports 0 new critical or serious violations

### Responsive / Mobile

- [ ] Test at 320px width (mobile breakpoint) — columns stack vertically
- [ ] Test at 768px (tablet) and 1280px (desktop)
- [ ] Touch targets are ≥ 44px on mobile viewports

---

## Key Keyboard Shortcuts to Verify

| Shortcut            | Expected behaviour                      |
| ------------------- | --------------------------------------- |
| `Ctrl+N`            | Opens "New Task" dialog                 |
| `Alt+→`             | Moves focused task to next column       |
| `Alt+←`             | Moves focused task to previous column   |
| `Delete`            | Prompts deletion of focused task        |
| `Esc`               | Closes open dialog without saving       |
| `?`                 | Opens Help overlay                      |
| `Tab` / `Shift+Tab` | Cycles through all interactive elements |

---

## localStorage Verification Steps

```
1. Open browser DevTools → Application → Local Storage → [origin]
2. Check key: taskboard-projects — verify JSON structure matches domain/glossary.md schema
3. Check key: taskboard-active-project — verify correct project ID is stored
4. Create / move / delete a task → verify the JSON updates in real time
5. Reload page → verify UI matches the stored JSON exactly
```

---

## Bug Report Format

```
**Story:** STORY-<id>
**Severity:** Critical / High / Medium / Low
**Summary:** [one-line description]

**Steps to reproduce:**
1. ...
2. ...

**Expected:** [what should happen]
**Actual:** [what actually happened]

**Environment:** Browser + version, viewport width
**localStorage state:** [paste relevant JSON snippet if applicable]
```

### Severity Guide

| Severity | Definition                                            |
| -------- | ----------------------------------------------------- |
| Critical | Data loss, app crash, or security issue               |
| High     | Acceptance criterion not met; blocks story completion |
| Medium   | Degraded UX; workaround exists                        |
| Low      | Polish / cosmetic issue; does not block functionality |

---

## Acceptance Criteria Format (for reviewing stories)

Good acceptance criteria are:

- **Specific** — refers to a named element, action, or state
- **Testable** — pass/fail determinable without ambiguity
- **Independent** — each criterion can be verified on its own

Red flags to flag back to PM:

- "The UI should look good" — not testable
- "The app should be fast" — needs a specific number (< 2 s)
- "Users should be able to manage tasks" — too broad

---

## Performance Targets (verify with Lighthouse)

| Metric             | Target | How to measure                                         |
| ------------------ | ------ | ------------------------------------------------------ |
| Page load          | < 2 s  | Lighthouse → Performance → First Contentful Paint      |
| Lighthouse score   | ≥ 90   | Lighthouse Performance panel, average 5 runs           |
| Task creation      | < 10 s | Manual timer: click "New Task" → task appears in board |
| Drag-and-drop move | < 3 s  | Manual timer: drop event → board update                |

---

## Accessibility Audit Steps

1. Install axe DevTools browser extension.
2. Open the app and navigate to the feature under test.
3. Run the axe scan — record any new critical/serious violations.
4. Run Lighthouse (Accessibility category) — target score ≥ 90.
5. Test with keyboard only: Tab through all interactive elements, complete the core flow.
6. (Optional) Test with VoiceOver (macOS) or NVDA (Windows) for screen reader announcements.

---

## Related Files

- [domain/glossary.md](../domain/glossary.md) — Term definitions for bug reports and test descriptions
- [conventions/coding-standards.md](../conventions/coding-standards.md) — Definition of Done (QA gates)
- [workflows/development-process.md](../workflows/development-process.md) — What QA checks before a PR merges
- [specs/prds/prd-personal-task-board.md](../../specs/prds/prd-personal-task-board.md) — Full FR/NFR list and success metrics
