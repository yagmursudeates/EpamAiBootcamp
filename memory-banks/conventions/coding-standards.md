# Coding Standards: Personal Task Board

Version: 1.1
Date: 2026-05-13
Source: agents.md · specs/prds/prd-personal-task-board.md

---

## Naming Conventions

### Source Code

| Target | Convention | Examples |
|--------|-----------|---------|
| React component files | PascalCase + `.tsx` | `TaskCard.tsx`, `BoardColumn.tsx`, `HelpOverlay.tsx` |
| Non-component TS files | camelCase + `.ts` | `persistenceService.ts`, `generateId.ts`, `useKeyboard.ts` |
| Test files | same name + `.test.ts(x)` | `TaskCard.test.tsx`, `persistenceService.test.ts` |
| CSS Module files | same name + `.module.css` | `TaskCard.module.css` |
| React components | PascalCase | `TaskCard`, `BoardColumn`, `ProjectSelector` |
| Functions / variables | camelCase | `createTask`, `activeProjectId`, `handleDrop` |
| Custom hooks | camelCase, `use` prefix | `useTasks`, `useProjects`, `useKeyboardShortcuts` |
| Types / Interfaces | PascalCase | `Task`, `Project`, `AppState`, `BoardColumn` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_COLUMNS`, `LOCAL_STORAGE_KEY`, `MAX_TITLE_LENGTH` |
| CSS classes (Modules) | kebab-case | `.task-card`, `.board-column`, `.drag-overlay` |
| localStorage keys | kebab-case with app prefix | `taskboard-projects`, `taskboard-active-project` |
| Event handlers | `handle` prefix + noun + event | `handleTaskSave`, `handleColumnDrop`, `handleKeyDown` |

**Examples:**

```typescript
// Correct
const MAX_TITLE_LENGTH = 200;
const LOCAL_STORAGE_KEY = 'taskboard-projects';

function createTask(title: string, projectId: string): Task { ... }
function handleDrop(event: DragEvent, targetColumn: ColumnId): void { ... }

interface Task {
  id: string;
  title: string;
  column: ColumnId;
  order: number;
}

// Incorrect
const maxlength = 200;          // not UPPER_SNAKE_CASE
function Create_Task() { ... }  // mixed case
interface task { ... }          // should be PascalCase
```

### Spec / Documentation Files (from agents.md)

| Target | Convention | Examples |
|--------|-----------|---------|
| All spec files | kebab-case, lowercase | `prd-personal-task-board.md` |
| PRDs | `prd-<short-name>.md` | `prd-personal-task-board.md` |
| Epics | `epic-<short-name>.md` | `epic-core-task-management.md` |
| Stories | `story-<ticket-id>.md` | `story-core-task-01.md` |
| Spec headers | must include Version, Author, Date | see below |

**Spec file header example:**
```markdown
# [Document Title]

Version: 1.0
Author: [Name]
Date: YYYY-MM-DD
```

---

## File Structure

```
/                               # workspace root
  agents.md                     # AI + human conventions (source of truth)
  memory-banks/                 # AI assistant context bank
    architecture/overview.md
    conventions/coding-standards.md
    domain/glossary.md
    workflows/development-process.md
    roles/
  specs/                        # product specs
    templates/                  # prd-template.md, epic-template.md, story-template.md
    prds/                       # prd-<short-name>.md
    epics/                      # epic-<short-name>.md
    stories/                    # story-<ticket-id>.md
    assets/                     # images, wireframes
  src/
    components/                 # React UI -- one component per file, co-located tests
      Board/
        BoardColumn.tsx
        BoardColumn.module.css
        BoardColumn.test.tsx
      Task/
        TaskCard.tsx
        TaskCard.module.css
        TaskCard.test.tsx
        TaskDialog.tsx
        TaskDialog.test.tsx
      Project/
        ProjectSelector.tsx
        ProjectSelector.test.tsx
      Help/
        HelpOverlay.tsx
        HelpOverlay.test.tsx
    hooks/                      # Custom hooks -- one concern per hook
      useTasks.ts
      useProjects.ts
      useKeyboardShortcuts.ts
    context/                    # React context providers and reducers
      AppContext.tsx
      appReducer.ts
      appReducer.test.ts
    services/                   # Non-UI business logic -- fully unit-tested
      persistenceService.ts
      persistenceService.test.ts
      validationService.ts
      validationService.test.ts
    types/                      # Shared TypeScript types and interfaces
      index.ts
    utils/                      # Pure utility functions -- no side effects
      generateId.ts
      sortTasks.ts
    App.tsx
    main.tsx
  public/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
```

---

## Code Organization

### General Rules

- **Maximum function length**: 40 lines. If longer, extract into named helpers.
- **One component per file**: Yes. Never export two components from one file.
- **One concern per hook**: `useTasks` handles tasks; `useProjects` handles projects. Do not combine.
- **DRY principle**: Extract shared logic when it appears in 3+ places, or when the logic is complex enough to warrant a name. Do not abstract one-off operations.
- **No business logic in components**: Components render and handle events. State mutations and `localStorage` writes belong in the context reducer or a service.
- **Immutability**: Always return new objects/arrays. Never mutate state in place.

**Example -- correct separation of concerns:**

```typescript
// Service handles business logic
// services/persistenceService.ts
export function saveProjects(projects: Project[]): Result<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ version: 1, projects }));
    return { ok: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, error: 'Storage is full. Delete some tasks to free space.' };
    }
    return { ok: false, error: 'Failed to save. Please try again.' };
  }
}

// Component only renders and dispatches
// components/Task/TaskCard.tsx
export function TaskCard({ task, onMove }: TaskCardProps) {
  return (
    <article className={styles['task-card']} aria-label={task.title}>
      <h3>{task.title}</h3>
      <button onClick={() => onMove(task.id, 'inprogress')}>Move to In Progress</button>
    </article>
  );
}

// Do NOT put localStorage calls directly in components
export function TaskCard({ task }: TaskCardProps) {
  function handleDelete() {
    const raw = localStorage.getItem('taskboard-projects'); // wrong layer
  }
}
```

### Reducer Pattern

```typescript
// context/appReducer.ts
type Action =
  | { type: 'CREATE_TASK'; payload: { title: string; projectId: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; column: ColumnId } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_TASK':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, tasks: [...p.tasks, newTask(action.payload.title)] }
            : p
        ),
      };
    default:
      return state;
  }
}
```

---

## Comments

- **JSDoc required** for all exported functions in `services/` and `utils/`. Not required for React components (prop types serve as documentation).
- **Inline comments**: Use when intent is non-obvious from the name alone. Do not restate what the code does.
- **TODOs**: `// TODO(username): description -- STORY-<id>` format.
- **No commented-out code**: Delete it. Use git history to recover.

**Examples:**

```typescript
// JSDoc for service function
/**
 * Saves all projects to localStorage.
 * Returns an error result if the storage quota is exceeded.
 */
export function saveProjects(projects: Project[]): Result<void> { ... }

// Inline comment explaining non-obvious intent
// order starts at 1000 to leave room for insertions above position 0
const DEFAULT_ORDER_START = 1000;

// TODO with owner and story link
// TODO(yagmur): Add undo support after move -- STORY-board-org-02

// Restates the code -- don't do this
// increment counter by 1
counter++;
```

---

## Testing Requirements

### Test Types

| Type | Where | Tool | Coverage target |
|------|-------|------|----------------|
| Unit | `services/`, `utils/`, `context/` | Vitest | >=80% |
| Integration | `components/` with user events | Vitest + React Testing Library | Key flows |
| E2E | Not required for MVP | -- | -- |

### Test File Conventions

```
src/services/persistenceService.ts      <- source
src/services/persistenceService.test.ts <- test (co-located)
```

### Test Structure Example

```typescript
// services/persistenceService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveProjects, loadProjects } from './persistenceService';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  // Stub localStorage -- never use real localStorage in unit tests
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  });
});

describe('saveProjects', () => {
  it('should persist projects to localStorage', () => {
    const projects = [{ id: 'p1', name: 'Test', tasks: [], columns: [] }];
    const result = saveProjects(projects);
    expect(result.ok).toBe(true);
    expect(loadProjects()).toEqual(projects);
  });

  it('should return an error result when quota is exceeded', () => {
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new DOMException('QuotaExceededError'); },
    });
    const result = saveProjects([]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/storage is full/i);
  });
});
```

### Component Test Example

```typescript
// components/Task/TaskDialog.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDialog } from './TaskDialog';

it('should show a validation error when title is empty', async () => {
  const onSave = vi.fn();
  render(<TaskDialog onSave={onSave} onCancel={() => {}} />);

  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i);
  expect(onSave).not.toHaveBeenCalled();
});
```

### Mocking Rules

- Mock `localStorage` with an in-memory stub (see above). Never rely on real browser `localStorage` in tests.
- Do not mock React state or context -- render with a real provider.
- Prefer `getByRole` over `getByTestId` to keep tests accessibility-aligned.

---

## Error Handling

### Result Type Pattern

Return typed result objects from service functions instead of throwing:

```typescript
// types/index.ts
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

// Usage in a service
export function validateTask(title: string): Result<void> {
  if (!title.trim()) {
    return { ok: false, error: 'Task title is required.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  return { ok: true, value: undefined };
}

// Usage in a component / hook
const result = validateTask(title);
if (!result.ok) {
  setError(result.error); // display to user
  return;
}
dispatch({ type: 'CREATE_TASK', payload: { title, projectId } });
```

### localStorage Error Handling

```typescript
export function saveProjects(projects: Project[]): Result<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ version: 1, projects }));
    return { ok: true, value: undefined };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, error: 'Storage is full. Delete some tasks to free space.' };
    }
    console.error('[TaskBoard] Unexpected error saving projects:', e);
    return { ok: false, error: 'Failed to save. Please try again.' };
  }
}
```

### Logging Convention

```typescript
// Correct -- namespaced, contextual
console.error('[TaskBoard] Failed to parse localStorage data:', e);
console.warn('[TaskBoard] localStorage schema version mismatch -- migrating');

// Incorrect -- no context, left in production code
console.log('data', data);
```

### Rules Summary

- **Never silently swallow errors** -- always return a result or log.
- **User-facing messages**: plain English, actionable, no stack traces or technical jargon.
- **`QuotaExceededError`**: always surfaced to user with a clear action (delete tasks).
- **No unhandled promise rejections**: any async call added in v2 must have `.catch()` or `try/catch`.
- **Parsing errors**: if `localStorage` data cannot be parsed (corrupt JSON), reset to empty state and log a warning.

---

## Quality Criteria

### Definition of Done

- [ ] Acceptance criteria from the linked story are met and manually verified
- [ ] Unit tests written and passing; >=80% coverage maintained for `services/` and `utils/`
- [ ] `tsc --noEmit` passes with zero errors
- [ ] ESLint + Prettier checks pass (`npm run lint`)
- [ ] Keyboard navigation verified for the new feature (Tab, Shift+Tab, Enter, Esc)
- [ ] axe-core reports 0 new critical/serious violations
- [ ] `localStorage` state persists correctly across page reload
- [ ] PR title or description references the story ID (e.g., `STORY-core-task-01`)
- [ ] No `console.log` debug statements left in production code

### Code Review Checklist

- [ ] Names follow the conventions table above
- [ ] No business logic inside React components (mutations in reducer/service)
- [ ] No hardcoded strings that should be constants
- [ ] `localStorage` errors handled via `Result` type; user sees actionable message
- [ ] Tests cover happy path and at least one validation/error case
- [ ] No commented-out code
- [ ] ARIA roles, labels, and focus management correct for new interactive elements
- [ ] Spec file (if changed) follows `agents.md` naming and includes Version/Author/Date header

### Performance Expectations

| Operation | Target | Measurement |
|-----------|--------|-------------|
| App initial load | < 2 s | Lighthouse average of 5 runs |
| Task creation (click to board) | < 10 s | Client-side timer |
| Drag-and-drop move | < 3 s | Drop event to board update |
| `localStorage` read/write | synchronous, non-blocking | Manual check with <=500 tasks |
| Lighthouse performance score | >= 90 | CI Lighthouse run |

---

## AI Assistant Guidance (from agents.md)

When generating or modifying code or specs for this project:

1. **Always read the relevant template** in `specs/templates/` before creating a spec file.
2. **Follow naming conventions** from this document and `agents.md`. Include Version/Author/Date in spec headers.
3. **Never introduce backend code** -- all persistence is via browser `localStorage`.
4. **Link related files** using relative paths and include story IDs in commit messages and PR descriptions.
5. **Prefer actionable acceptance criteria** -- each criterion must be independently testable.
6. **Use the `Result<T>` pattern** for service functions; do not throw for expected validation failures.

---

## Related Files

- [agents.md](../../agents.md) — Primary source of truth for spec conventions and tech stack
- [architecture/overview.md](../architecture/overview.md) — System design and localStorage schema
- [domain/glossary.md](../domain/glossary.md) — Term definitions (Task, Column, Project, Board)
- [workflows/development-process.md](../workflows/development-process.md) — How to implement and ship a story
