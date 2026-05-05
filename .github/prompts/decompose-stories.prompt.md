---
description: "Break Epic into User Stories"
---

/ decompose-stories

Usage
Provide either a path to an existing Epic (relative to the repo root) or paste the Epic markdown after the command. Example:
/decompose-stories specs/epics/EPIC-01-onboarding-email-verification.md

Or:
/decompose-stories
<paste full Epic markdown here>

Instructions for the assistant
1. Read the Epic provided (or at the path) and follow the story template at specs/templates/story-template.md for formatting.
2. Create 5–7 user stories that together implement the epic. For each story:
   - Use the canonical User Story format: "As a [persona], I want [action] so that [benefit]".
   - Ensure each story is completable within 1–3 days (or equivalent small story points).
   - Provide 3–5 specific, testable acceptance criteria (GIVEN/WHEN/THEN or equivalent).
   - Add optional Technical Notes and an Estimation (story points or days).
   - Validate INVEST principles for each story (add short justifications in the INVEST checklist area of the template).
3. Use the story-template.md fields: Story ID & Title, User Story, Acceptance Criteria, Technical Notes, Estimation, INVEST checklist, Appendix/Links.
4. Derive filenames as: specs/stories/STORY-{epic-short-name}.{NN}-{kebab-name}.md where {epic-short-name} is a short identifier from the epic (kebab-case) and {NN} is a two-digit sequence starting at 01. Example: specs/stories/STORY-onboarding-01-email-verification.md
5. Include header metadata (Version, Author, Date) in each story file. Use the current date if not provided.
6. If the Epic lacks a primary persona, clear success metric mapping, or scope info required to create small stories, ask one concise clarifying question before generating the stories.
7. After generating files, output a summary listing created file paths and any assumptions or missing info.

Quality checklist (validate before saving)
- Each story follows the "As a... I want... so that..." format (YES/NO)
- Each story is estimable and sized for 1–3 days (YES/NO)
- Each story has 3–5 testable acceptance criteria (YES/NO)
- Each story passes INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable) — list YES/NO per story
- Filenames follow the naming convention (YES/NO)

Output format
- Produce 5–7 markdown files under specs/stories/ using specs/templates/story-template.md.
- Each file must be saved and the assistant should print the relative path(s) of created files and a 3-line summary: assumptions, missing info (if any), and filenames.

Notes for users
- Best results when the Epic has: primary persona, success criteria, and a short scope summary.
- Prefer asking one clarifying question rather than guessing missing critical info.

