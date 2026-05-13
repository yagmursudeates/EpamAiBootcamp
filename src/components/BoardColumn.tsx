import { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { ColumnId } from '../types';
import { COLUMN_LABELS } from '../types';
import { useBoard } from '../state/BoardContext';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';
import styles from './BoardColumn.module.css';

interface BoardColumnProps {
  columnId: ColumnId;
}

export function BoardColumn({ columnId }: BoardColumnProps) {
  const { dispatch, getColumnTasks, columnTaskCount } = useBoard();
  const [creating, setCreating] = useState(false);
  const tasks = getColumnTasks(columnId);
  const count = columnTaskCount[columnId];

  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  function handleCreateTask(title: string, description: string) {
    dispatch({ type: 'CREATE_TASK', payload: { title, description } });
    // Move to this column if it's not 'todo'
    setCreating(false);
  }

  return (
    <section
      className={`${styles.column} ${isOver ? styles.columnOver : ''}`}
      aria-label={`${COLUMN_LABELS[columnId]} column, ${count} task${count !== 1 ? 's' : ''}`}
    >
      <div className={styles.columnHeader}>
        <h2 className={styles.columnTitle}>{COLUMN_LABELS[columnId]}</h2>
        <span className={styles.badge} aria-label={`${count} tasks`}>{count}</span>
      </div>

      <div ref={setNodeRef} className={styles.taskList}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className={styles.emptyMsg}>No tasks yet</p>
        )}
      </div>

      {columnId === 'todo' && (
        <button
          className={styles.addBtn}
          onClick={() => setCreating(true)}
          aria-label="Add new task"
          title="Add task (Ctrl+N)"
        >
          + Add Task
        </button>
      )}

      {creating && (
        <TaskDialog
          mode="create"
          onSave={handleCreateTask}
          onCancel={() => setCreating(false)}
        />
      )}
    </section>
  );
}
