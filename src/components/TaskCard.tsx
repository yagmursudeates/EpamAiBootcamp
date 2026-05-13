import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import { TaskDialog } from './TaskDialog';
import { useBoard } from '../state/BoardContext';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { dispatch } = useBoard();
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function handleDelete() {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      dispatch({ type: 'DELETE_TASK', payload: { id: task.id } });
    }
  }

  function handleSave(title: string, description: string) {
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, title, description } });
    setEditing(false);
  }

  return (
    <>
      <article
        ref={setNodeRef}
        style={style}
        className={styles.card}
        aria-label={`Task: ${task.title}`}
        data-task-id={task.id}
        tabIndex={0}
      >
        <div
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          ⠿
        </div>
        <div className={styles.content}>
          <p className={styles.title}>{task.title}</p>
          {task.description && <p className={styles.description}>{task.description}</p>}
        </div>
        <div className={styles.cardActions}>
          <button
            className={styles.iconBtn}
            onClick={() => setEditing(true)}
            aria-label={`Edit task: ${task.title}`}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className={`${styles.iconBtn} ${styles.deleteBtn}`}
            onClick={handleDelete}
            aria-label={`Delete task: ${task.title}`}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </article>
      {editing && (
        <TaskDialog
          mode="edit"
          initialTitle={task.title}
          initialDescription={task.description}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}
