import { useEffect, useRef } from 'react';
import type { ColumnId } from '../types';
import { COLUMNS } from '../types';
import { useBoard } from '../state/BoardContext';

interface UseKeyboardShortcutsOptions {
  onOpenCreate: () => void;
  onOpenHelp: () => void;
}

export function useKeyboardShortcuts({ onOpenCreate, onOpenHelp }: UseKeyboardShortcutsOptions) {
  const { state, dispatch } = useBoard();
  // track focused task id
  const focusedTaskId = useRef<string | null>(null);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      // Ctrl+N — create task (even in edit mode we block default browser)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (!isEditing) onOpenCreate();
        return;
      }

      if (isEditing) return;

      // ? — help
      if (e.key === '?') {
        onOpenHelp();
        return;
      }

      // Alt+→ / Alt+← — move focused task to next/prev column
      if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const el = document.activeElement as HTMLElement | null;
        const taskEl = el?.closest('[data-task-id]') as HTMLElement | null;
        const taskId = taskEl?.dataset.taskId ?? null;
        if (!taskId) return;
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const currentIndex = COLUMNS.indexOf(task.column as ColumnId);
        const nextIndex = e.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;
        e.preventDefault();
        dispatch({ type: 'MOVE_TASK', payload: { id: taskId, column: COLUMNS[nextIndex] } });
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.tasks, dispatch, onOpenCreate, onOpenHelp]);

  return { focusedTaskId };
}
