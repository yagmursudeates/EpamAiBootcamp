import type { AppState } from '../types';
import { generateId } from '../utils/generateId';

export const LOCAL_STORAGE_KEY = 'taskboard-projects';
const SCHEMA_VERSION = 1;

export function createDefaultState(): AppState {
  const projectId = generateId('proj');
  return {
    version: SCHEMA_VERSION,
    activeProjectId: projectId,
    projects: [{ id: projectId, name: 'My Project', createdAt: new Date().toISOString() }],
    tasks: [],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== SCHEMA_VERSION) return createDefaultState();
    return parsed;
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Some data may not have been saved.');
      throw new Error('Storage quota exceeded. Please delete some tasks or projects to free up space.');
    }
    throw err;
  }
}
