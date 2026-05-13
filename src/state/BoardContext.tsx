import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import type { AppState, Task, ColumnId } from '../types';
import { boardReducer, type Action, getTasksForColumn, getActiveProject, getColumnTaskCount } from './boardReducer';
import { loadState, saveState } from '../services/persistenceService';

interface BoardContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getColumnTasks: (col: ColumnId) => Task[];
  activeProject: ReturnType<typeof getActiveProject>;
  columnTaskCount: ReturnType<typeof getColumnTaskCount>;
  storageError: string | null;
  clearStorageError: () => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, undefined, loadState);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      saveState(state);
    } catch (err) {
      if (err instanceof Error) setStorageError(err.message);
    }
  }, [state]);

  const getColumnTasks = useCallback(
    (col: ColumnId) => getTasksForColumn(state, col),
    [state],
  );
  const activeProject = getActiveProject(state);
  const columnTaskCount = getColumnTaskCount(state);
  const clearStorageError = useCallback(() => setStorageError(null), []);

  return (
    <BoardContext.Provider value={{ state, dispatch, getColumnTasks, activeProject, columnTaskCount, storageError, clearStorageError }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
