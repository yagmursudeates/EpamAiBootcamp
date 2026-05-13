export type ColumnId = 'todo' | 'inprogress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  column: ColumnId;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppState {
  version: number;
  activeProjectId: string | null;
  projects: Project[];
  tasks: Task[];
}

export const COLUMN_LABELS: Record<ColumnId, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

export const COLUMNS: ColumnId[] = ['todo', 'inprogress', 'done'];

export const LOCAL_STORAGE_KEY = 'taskboard-projects';
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
