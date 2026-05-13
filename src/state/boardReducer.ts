import type { AppState, Task, Project, ColumnId } from '../types';
import { generateId } from '../utils/generateId';
import { COLUMNS } from '../types';

export type Action =
  | { type: 'CREATE_TASK'; payload: { title: string; description: string } }
  | { type: 'UPDATE_TASK'; payload: { id: string; title: string; description: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'MOVE_TASK'; payload: { id: string; column: ColumnId } }
  | { type: 'REORDER_TASKS'; payload: { activeId: string; overId: string; column: ColumnId } }
  | { type: 'CREATE_PROJECT'; payload: { name: string } }
  | { type: 'SWITCH_PROJECT'; payload: { id: string } }
  | { type: 'DELETE_PROJECT'; payload: { id: string } }
  | { type: 'CLEAR_ALL' };

export function boardReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_TASK': {
      const now = new Date().toISOString();
      const existingInTodo = state.tasks.filter(
        (t) => t.column === 'todo' && t.projectId === state.activeProjectId,
      );
      const newTask: Task = {
        id: generateId('task'),
        title: action.payload.title.trim(),
        description: action.payload.description.trim(),
        column: 'todo',
        order: existingInTodo.length,
        projectId: state.activeProjectId ?? '',
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'UPDATE_TASK': {
      const now = new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? { ...t, title: action.payload.title.trim(), description: action.payload.description.trim(), updatedAt: now }
            : t,
        ),
      };
    }

    case 'DELETE_TASK': {
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload.id) };
    }

    case 'MOVE_TASK': {
      const now = new Date().toISOString();
      const { id, column } = action.payload;
      const tasksInTarget = state.tasks.filter(
        (t) => t.column === column && t.projectId === state.activeProjectId && t.id !== id,
      );
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, column, order: tasksInTarget.length, updatedAt: now } : t,
        ),
      };
    }

    case 'REORDER_TASKS': {
      const { activeId, overId, column } = action.payload;
      const now = new Date().toISOString();
      const columnTasks = state.tasks
        .filter((t) => t.column === column && t.projectId === state.activeProjectId)
        .sort((a, b) => a.order - b.order);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);
      if (activeIndex === -1 || overIndex === -1) return state;
      const reordered = [...columnTasks];
      const [moved] = reordered.splice(activeIndex, 1);
      reordered.splice(overIndex, 0, moved);
      const updatedIds = new Set(reordered.map((t) => t.id));
      const reorderedWithOrder = reordered.map((t, i) => ({ ...t, order: i, updatedAt: now }));
      return {
        ...state,
        tasks: [...state.tasks.filter((t) => !updatedIds.has(t.id)), ...reorderedWithOrder],
      };
    }

    case 'CREATE_PROJECT': {
      const newProject: Project = {
        id: generateId('proj'),
        name: action.payload.name.trim(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
        activeProjectId: newProject.id,
      };
    }

    case 'SWITCH_PROJECT': {
      return { ...state, activeProjectId: action.payload.id };
    }

    case 'DELETE_PROJECT': {
      const remaining = state.projects.filter((p) => p.id !== action.payload.id);
      const newActive =
        state.activeProjectId === action.payload.id ? (remaining[0]?.id ?? null) : state.activeProjectId;
      return {
        ...state,
        projects: remaining,
        tasks: state.tasks.filter((t) => t.projectId !== action.payload.id),
        activeProjectId: newActive,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.projectId !== state.activeProjectId),
      };
    }

    default:
      return state;
  }
}

export function getTasksForColumn(state: AppState, column: ColumnId): Task[] {
  return state.tasks
    .filter((t) => t.projectId === state.activeProjectId && t.column === column)
    .sort((a, b) => a.order - b.order);
}

export function getActiveProject(state: AppState): Project | undefined {
  return state.projects.find((p) => p.id === state.activeProjectId);
}

export function getColumnTaskCount(state: AppState): Record<ColumnId, number> {
  const result: Record<ColumnId, number> = { todo: 0, inprogress: 0, done: 0 };
  for (const col of COLUMNS) {
    result[col] = state.tasks.filter(
      (t) => t.projectId === state.activeProjectId && t.column === col,
    ).length;
  }
  return result;
}
