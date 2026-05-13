# Role Context: Developer — Personal Task Board

Version: 1.0
Date: 2026-05-13

---

## Your Role

You are implementing features on a **frontend-only React + TypeScript SPA**. There is no backend, no server, and no database. All persistence is via browser `localStorage`. Your primary inputs are user stories in `specs/stories/` and your primary constraints are in `agents.md`.

---

## Before You Write Any Code

1. Read the story: `specs/stories/STORY-<id>.md` — understand all acceptance criteria.
2. Read `memory-banks/domain/glossary.md` — use correct domain terms in names.
3. Read `memory-banks/conventions/coding-standards.md` — follow naming and patterns exactly.
4. Read `memory-banks/architecture/overview.md` — place code in the correct layer.

---

## Where to Put New Code

| What you're building         | Where it goes                                        |
| ---------------------------- | ---------------------------------------------------- |
| UI component                 | `src/components/<Domain>/<ComponentName>.tsx`        |
| Component styles             | `src/components/<Domain>/<ComponentName>.module.css` |
| Component tests              | `src/components/<Domain>/<ComponentName>.test.tsx`   |
| Custom hook                  | `src/hooks/use<Concern>.ts`                          |
| Business logic / persistence | `src/services/<name>Service.ts`                      |
| Service tests                | `src/services/<name>Service.test.ts`                 |
| State shape / action types   | `src/context/appReducer.ts`                          |
| Shared TypeScript types      | `src/types/index.ts`                                 |
| Pure utility functions       | `src/utils/<name>.ts`                                |

---

## Implementation Checklist (per story)

- [ ] Service function written and unit-tested first (test-first preferred)
- [ ] Reducer action added (if state changes)
- [ ] Component written — renders and dispatches only; no business logic
- [ ] Props typed with a `<ComponentName>Props` interface
- [ ] localStorage write happens on every state mutation (via `persistenceService`)
- [ ] Validation uses `Result<T>` return type — no throwing for expected errors
- [ ] ARIA roles, labels, and focus management implemented for any new interactive elements
- [ ] Keyboard interaction works (Tab, Enter, Esc) for any new dialog or control
- [ ] `tsc --noEmit`, `npm run lint`, `npm run test:run` all pass locally

---

## Key Patterns to Follow

### 1. Service function with Result type

```typescript
// src/services/validationService.ts
export function validateTask(title: string): Result<void> {
  if (!title.trim()) return { ok: false, error: "Task title is required." };
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }
  return { ok: true, value: undefined };
}
```

### 2. Persistence service — always goes through here

```typescript
// src/services/persistenceService.ts
export function saveProjects(projects: Project[]): Result<void> {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ version: 1, projects }),
    );
    return { ok: true, value: undefined };
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      return {
        ok: false,
        error: "Storage is full. Delete some tasks to free space.",
      };
    }
    console.error("[TaskBoard] Unexpected error saving projects:", e);
    return { ok: false, error: "Failed to save. Please try again." };
  }
}
```

### 3. Reducer action — immutable state update

```typescript
case 'CREATE_TASK': {
  const result = validateTask(action.payload.title);
  if (!result.ok) return { ...state, lastError: result.error };
  return {
    ...state,
    projects: state.projects.map(p =>
      p.id === action.payload.projectId
        ? { ...p, tasks: [...p.tasks, newTask(action.payload.title)] }
        : p
    ),
  };
}
```

### 4. Component — render and dispatch only

```typescript
export function TaskCard({ task, onMove }: TaskCardProps) {
  return (
    <article className={styles['task-card']} aria-label={task.title}>
      <h3>{task.title}</h3>
      <button onClick={() => onMove(task.id, 'inprogress')}>
        Move to In Progress
      </button>
    </article>
  );
}
```

---

## Hard Rules

- **No `localStorage` calls in components** — only in `persistenceService.ts`
- **No backend, no fetch, no API calls** — this constraint is permanent for v1
- **No direct state mutation** — always return new objects/arrays from reducers
- **New tasks always go to `todo` column** — regardless of which column is focused
- **Every mutation must write to localStorage** — before the function returns

---

## Keyboard Shortcuts to Implement/Respect

| Shortcut | Action                                  |
| -------- | --------------------------------------- |
| `Ctrl+N` | Open "New Task" dialog                  |
| `Alt+→`  | Move focused task to next column        |
| `Alt+←`  | Move focused task to previous column    |
| `Delete` | Delete focused task (with confirmation) |
| `Esc`    | Close dialog / cancel action            |
| `?`      | Open Help overlay                       |

---

## Related Files

- [agents.md](../../agents.md) — Tech stack and spec conventions
- [architecture/overview.md](../architecture/overview.md) — System design and localStorage schema
- [conventions/coding-standards.md](../conventions/coding-standards.md) — Naming, patterns, Definition of Done
- [workflows/development-process.md](../workflows/development-process.md) — PR process, branch naming, CI pipeline
