import { useState } from 'react';
import { BoardProvider, useBoard } from './state/BoardContext';
import { Board } from './components/Board';
import { ProjectSelector } from './components/ProjectSelector';
import { HelpOverlay } from './components/HelpOverlay';
import { TaskDialog } from './components/TaskDialog';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import styles from './App.module.css';

function AppShell() {
  const { dispatch, activeProject, storageError, clearStorageError } = useBoard();
  const [showHelp, setShowHelp] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useKeyboardShortcuts({
    onOpenCreate: () => setShowCreate(true),
    onOpenHelp: () => setShowHelp((v) => !v),
  });

  function handleCreateTask(title: string, description: string) {
    dispatch({ type: 'CREATE_TASK', payload: { title, description } });
    setShowCreate(false);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo} aria-hidden="true">📋</span>
          <h1 className={styles.appTitle}>Task Board</h1>
          {activeProject && (
            <span className={styles.projectName}>{activeProject.name}</span>
          )}
        </div>
        <div className={styles.headerRight}>
          <ProjectSelector />
          <button
            className={styles.newTaskBtn}
            onClick={() => setShowCreate(true)}
            aria-label="Create new task (Ctrl+N)"
            title="New task (Ctrl+N)"
          >
            + New Task
          </button>
          <button
            className={styles.helpBtn}
            onClick={() => setShowHelp(true)}
            aria-label="Open help"
            title="Help (?)"
          >
            ?
          </button>
        </div>
      </header>

      {storageError && (
        <div className={styles.errorBanner} role="alert">
          <strong>Storage error:</strong> {storageError}
          <button className={styles.dismissBtn} onClick={clearStorageError} aria-label="Dismiss error">✕</button>
        </div>
      )}

      <main className={styles.main}>
        <Board />
      </main>

      {showCreate && (
        <TaskDialog mode="create" onSave={handleCreateTask} onCancel={() => setShowCreate(false)} />
      )}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}

function App() {
  return (
    <BoardProvider>
      <AppShell />
    </BoardProvider>
  );
}

export default App;
