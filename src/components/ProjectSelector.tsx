import { useState } from 'react';
import { useBoard } from '../state/BoardContext';
import styles from './ProjectSelector.module.css';

export function ProjectSelector() {
  const { state, dispatch, activeProject } = useBoard();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setNameError('Project name is required.'); return; }
    if (trimmed.length > 80) { setNameError('Name must be 80 characters or fewer.'); return; }
    dispatch({ type: 'CREATE_PROJECT', payload: { name: trimmed } });
    setNewName('');
    setCreating(false);
    setNameError('');
  }

  function handleDelete() {
    if (state.projects.length <= 1) {
      alert('You must have at least one project.');
      return;
    }
    if (window.confirm(`Delete project "${activeProject?.name}" and all its tasks?`)) {
      dispatch({ type: 'DELETE_PROJECT', payload: { id: state.activeProjectId! } });
    }
  }

  return (
    <div className={styles.container}>
      <label htmlFor="project-select" className={styles.label}>Project</label>
      <div className={styles.row}>
        <select
          id="project-select"
          className={styles.select}
          value={state.activeProjectId ?? ''}
          onChange={(e) => dispatch({ type: 'SWITCH_PROJECT', payload: { id: e.target.value } })}
          aria-label="Select project"
        >
          {state.projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button className={styles.iconBtn} onClick={() => setCreating((v) => !v)} aria-label="New project" title="New project">
          ＋
        </button>
        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={handleDelete} aria-label="Delete current project" title="Delete project">
          🗑️
        </button>
      </div>
      {creating && (
        <form className={styles.newForm} onSubmit={handleCreate} noValidate>
          <input
            className={`${styles.input} ${nameError ? styles.inputError : ''}`}
            type="text"
            placeholder="Project name"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
            maxLength={80}
            autoFocus
            aria-label="New project name"
          />
          {nameError && <span className={styles.errorMsg} role="alert">{nameError}</span>}
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>Create</button>
            <button type="button" className={styles.btnSecondary} onClick={() => { setCreating(false); setNewName(''); setNameError(''); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
