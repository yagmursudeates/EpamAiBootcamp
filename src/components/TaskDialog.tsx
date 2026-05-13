import React, { useState } from 'react';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH } from '../types';
import styles from './TaskDialog.module.css';

interface TaskDialogProps {
  initialTitle?: string;
  initialDescription?: string;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export function TaskDialog({ initialTitle = '', initialDescription = '', onSave, onCancel, mode }: TaskDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [titleError, setTitleError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError('Title is required.');
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
      return;
    }
    onSave(trimmed, description.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onKeyDown={handleKeyDown}>
      <div className={styles.dialog}>
        <h2 id="dialog-title" className={styles.dialogTitle}>
          {mode === 'create' ? 'New Task' : 'Edit Task'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="task-title" className={styles.label}>
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className={`${styles.input} ${titleError ? styles.inputError : ''}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
              maxLength={MAX_TITLE_LENGTH}
              aria-required="true"
              aria-describedby={titleError ? 'title-error' : undefined}
              autoFocus
            />
            {titleError && (
              <span id="title-error" className={styles.errorMsg} role="alert">{titleError}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="task-desc" className={styles.label}>Description</label>
            <textarea
              id="task-desc"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={4}
            />
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {mode === 'create' ? 'Add Task' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
