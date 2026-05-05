# Product Requirements Document (PRD) Template

Version: [VERSION HERE]
Author: [NAME HERE]
Date: [DATE HERE]

## Table of Contents
- Overview
- User Personas
- Use Cases
- Functional Requirements
- Non-Functional Requirements
- Success Metrics
- Scope

---

## 1. Overview

### Purpose
[DESCRIPTION HERE]

### Problem Statement
[DESCRIPTION HERE]

### Goals
- [GOAL 1 — DESCRIPTION HERE]
- [GOAL 2 — DESCRIPTION HERE]
- [GOAL 3 — DESCRIPTION HERE]

---

## 2. User Personas (Who are we building for?)

- Persona 1: [NAME] — Role: [ROLE], Key characteristics: [CHARACTERISTICS], Needs: [NEEDS]
- Persona 2: [NAME] — Role: [ROLE], Key characteristics: [CHARACTERISTICS], Needs: [NEEDS]
- Persona 3: [NAME] — Role: [ROLE], Key characteristics: [CHARACTERISTICS], Needs: [NEEDS]

Notes: Add target segments, edge users, and any persona-driven constraints.

---

## 3. Use Cases (Key scenarios)

For each use case, include: title, actor, preconditions, main flow, alternative flows, and postconditions.

- Use Case: [TITLE]
  - Actor: [WHO]
  - Preconditions: [STATE OR ASSUMPTIONS]
  - Main Flow:
    1. [STEP 1]
    2. [STEP 2]
    3. [STEP N]
  - Alternative Flows / Errors: [DESCRIPTION]
  - Postconditions / Success Criteria: [DESCRIPTION]

Repeat for each key scenario.

---

## 4. Functional Requirements (What the system must do)

List requirements as atomic, testable statements. Prefer "The system shall..." phrasing.

- FR-001: The system shall [FUNCTIONAL REQUIREMENT DESCRIPTION].
  - Acceptance Criteria: [CRITERIA]
- FR-002: The system shall [FUNCTIONAL REQUIREMENT DESCRIPTION].
  - Acceptance Criteria: [CRITERIA]
- FR-003: The system shall [FUNCTIONAL REQUIREMENT DESCRIPTION].
  - Acceptance Criteria: [CRITERIA]

(Continue numbering as needed)

Dependencies: [EXTERNAL SYSTEMS, APIS, OR TEAMS]

---

## 5. Non-Functional Requirements (Performance, security, etc.)

- Performance: [e.g., "System shall handle X requests/sec" or "page load < Y ms"]
  - Target: [METRIC AND TARGET]
  - Measurement: [HOW TO MEASURE]

- Reliability & Availability:
  - Availability target: [e.g., 99.9%]
  - RTO / RPO: [VALUES]

- Security:
  - Data protection: [ENCRYPTION, STORAGE RULES]
  - Authentication/Authorization: [METHODS]
  - Compliance: [e.g., GDPR, HIPAA]

- Scalability: [EXPECTED growth assumptions and scaling strategy]

- Maintainability & Operability: [Logging, monitoring, runbooks, error budgets]

- Accessibility: [Standards to meet, e.g., WCAG 2.1 AA]

- Localization / Internationalization: [Languages, formats]

- Other constraints: [Browser support, devices, third-party limits]

---

## 6. Success Metrics (How we measure success)

List KPIs, targets, how to measure, and owners.

- Metric 1: [METRIC NAME]
  - Target: [TARGET VALUE]
  - Measurement Method: [HOW/WHERE IT'S TRACKED]
  - Owner: [ROLE OR PERSON]

- Metric 2: [METRIC NAME]
  - Target: [TARGET VALUE]
  - Measurement Method: [HOW/WHERE]
  - Owner: [ROLE OR PERSON]

- Metric 3: [METRIC NAME]
  - Target: [TARGET VALUE]
  - Measurement Method: [HOW/WHERE]
  - Owner: [ROLE OR PERSON]

Benchmarks / Baseline: [CURRENT VALUES]

---

## 7. Scope (What's in, what's out)

### In Scope
- [FEATURE / CAPABILITY A — DESCRIPTION]
- [FEATURE / CAPABILITY B — DESCRIPTION]
- [FEATURE / CAPABILITY C — DESCRIPTION]

### Out of Scope
- [ITEM A — DESCRIPTION]
- [ITEM B — DESCRIPTION]

### Assumptions
- [ASSUMPTION 1]
- [ASSUMPTION 2]

### Constraints
- [CONSTRAINT 1]
- [CONSTRAINT 2]

---

## Appendix
- Glossary: [TERMS]
- Open Questions: [QUESTIONS TO ANSWER]
- Related Documents: [LINKS TO SPEC, WIREFRAMES, FEP, ROADMAP]

