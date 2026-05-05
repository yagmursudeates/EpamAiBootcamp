# User Story: Test Accessibility with Automated Tools and Manual Testing

Version: 1.0
Author / Requester: GitHub Copilot
Date: May 5, 2026

---

## 1. Story ID and Title

- Story ID: STORY-ux-a11y-07
- Title: Test Accessibility with Automated Tools and Manual Testing

---

## 2. User Story

As a Product Lead, I want accessibility compliance verified, so that we meet WCAG 2.1 Level AA standards.

- Persona: Product Lead
- Context / Preconditions: MVP features are complete; ready for accessibility audit

---

## 3. Acceptance Criteria (3–5 testable conditions)

1. AC-1: GIVEN the task board application, WHEN an automated accessibility tool (aXe, Lighthouse, WAVE) audits the app, THEN 0 critical violations and 0 high violations are reported.
2. AC-2: GIVEN the task board is open, WHEN a keyboard-only user navigates all workflows (create task, move task, delete task), THEN all workflows complete successfully without a mouse.
3. AC-3: GIVEN the task board is open, WHEN a screen reader user (NVDA, JAWS, or VoiceOver on Mac) navigates the app, THEN all content is readable, interactive elements are labeled, and workflows are understandable.
4. AC-4: GIVEN the accessibility testing completes, WHEN an accessibility report is generated, THEN the report documents test methods, tools used, findings, and remediation actions.
5. AC-5: GIVEN the app is tested on mobile, WHEN accessibility checks are run, THEN touch targets meet 44px minimum, responsive layout works, and no accessibility issues exist.

---

## 4. Technical Notes (optional)

- Implementation hints:
  - Use automated tools: aXe, Lighthouse, WAVE
  - Manual testing: keyboard navigation, screen reader testing
  - Tools/Browsers: 
    - Screen readers: NVDA (Windows), JAWS (Windows), VoiceOver (Mac)
    - Browsers: Chrome, Firefox, Safari
  - Document findings in spreadsheet or accessibility audit document

- Testing scope:
  - All pages and workflows
  - All user interactions (forms, buttons, navigation)
  - All breakpoints (mobile, tablet, desktop)

- Testing notes:
  - Automated tools: Run as part of CI/CD if possible
  - Manual testing: Schedule 2-3 hours for thorough testing
  - Consider hiring accessibility consultant for third-party validation

---

## 5. Estimation

- Estimate: 5 story points (or 2 days)
- Confidence: MEDIUM
- Assumptions used for estimate: Manual testing required; automated tools available; screen readers installed

---

## 6. INVEST Validation Checklist

- **Independent:** PARTIALLY — Depends on all other stories (testing layer); validates quality
- **Negotiable:** YES — Testing methodology, tools, and rigor negotiable
- **Valuable:** YES — Ensures product meets accessibility standards; critical for compliance
- **Estimable:** YES — Testing scope defined; 2 day estimate
- **Small:** YES — Testing activity; completable within sprint (or dedicated QA sprint)
- **Testable:** YES — Audit results, test report, compliance verified

---

## Appendix / Links

- Related tickets: STORY-ux-a11y-01 through STORY-ux-a11y-06
- Tools: 
  - Automated: aXe, Lighthouse, WAVE, NVDA Inspector
  - Manual: NVDA (Windows), JAWS, VoiceOver (Mac)
- Standards: WCAG 2.1 Level AA
- Notes: Consider hiring accessibility consultant for final validation
