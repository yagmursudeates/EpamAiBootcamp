import styles from './HelpOverlay.module.css';

interface HelpOverlayProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: 'Ctrl + N', description: 'Create a new task' },
  { keys: 'Alt + →', description: 'Move focused task to the next column' },
  { keys: 'Alt + ←', description: 'Move focused task to the previous column' },
  { keys: '?', description: 'Open/close this help panel' },
  { keys: 'Esc', description: 'Close dialog / cancel action' },
  { keys: 'Tab / Shift+Tab', description: 'Navigate between interactive elements' },
];

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 id="help-title" className={styles.title}>Keyboard Shortcuts & Help</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close help">✕</button>
        </div>

        <section aria-labelledby="shortcuts-heading">
          <h3 id="shortcuts-heading" className={styles.sectionTitle}>Shortcuts</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map(({ keys, description }) => (
                <tr key={keys}>
                  <td><kbd className={styles.kbd}>{keys}</kbd></td>
                  <td>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="usage-heading" className={styles.usage}>
          <h3 id="usage-heading" className={styles.sectionTitle}>Basic Usage</h3>
          <ul className={styles.list}>
            <li>Click <strong>+ Add Task</strong> in the To Do column (or press <kbd>Ctrl+N</kbd>) to create a task with a title and optional description.</li>
            <li>Drag a task card to a different column to move it, or use <kbd>Alt+→</kbd> / <kbd>Alt+←</kbd> with keyboard focus on a card.</li>
            <li>Click the ✏️ button on a card to edit its title or description.</li>
            <li>Click the 🗑️ button to delete a task (a confirmation is shown).</li>
            <li>Use the <strong>Project</strong> selector at the top to switch between projects or create a new one.</li>
            <li>All data is automatically saved in your browser's local storage — it persists across page reloads.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
