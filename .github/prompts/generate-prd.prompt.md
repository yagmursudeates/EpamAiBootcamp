---
description: "Generate a PRD from project brief"
---

/ generate-prd

Usage
Provide a short project brief after the /generate-prd command. Example:
/generate-prd
Title: "Improve new-user onboarding"
Summary: "Reduce time-to-first-task for new users by simplifying signup and onboarding flows."
Target personas: "New users, product managers"

Instructions for the assistant
1. Read the PRD template at specs/templates/prd-template.md and follow its section order exactly.
2. Use the project brief input to populate each section with concrete, specific, and measurable details. Replace [PLACEHOLDER] entries with real content.
3. Derive a feature-name from the brief title (kebab-case, lowercase). Save the PRD to: specs/prds/PRD-{feature-name}.md and include the relative path at the top of your output.
4. Include header metadata: Version, Author, Date.
5. Ensure Success Metrics are SMART (Specific, Measurable, Achievable, Relevant, Time-bound) with numeric targets and measurement methods.
6. In Functional Requirements, produce atomic, testable "The system shall..." statements with acceptance criteria where relevant.
7. In Scope, explicitly list In Scope and Out of Scope items and key assumptions.
8. Add cross-links to related epics or stories (specs/epics/ and specs/stories/) if referenced.
9. If the brief lacks critical information needed to produce a valid PRD (e.g., target metrics, primary persona), ask one concise clarifying question before generating the PRD.
10. After generating the PRD, output a 3-line quality summary listing any assumptions made, missing info (if any), and the saved filename.

Quality checklist (must be validated before saving)
- Problem statement includes numbers or quantifiable impact (YES/NO)
- Primary personas are named and described (YES/NO)
- Goals are tied to measurable metrics (YES/NO)
- Success metrics are SMART with targets and owners (YES/NO)
- Functional requirements are atomic and testable (YES/NO)
- Scope clearly lists what's in and out (YES/NO)

Output format
- Produce one markdown file following specs/templates/prd-template.md content and format.
- At the end of the generated PRD include a "Quality Checklist" section showing YES/NO for each item above and any short notes.
- Save the file to specs/prds/PRD-{feature-name}.md. Also print the relative path in the assistant response.

Notes for human users
- Provide as much context as possible in the brief: target metrics, primary persona, success thresholds, timeline.
- If uncertain, the assistant will ask one clarifying question before producing the PRD.

