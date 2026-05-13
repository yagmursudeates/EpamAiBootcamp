import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { COLUMNS, type ColumnId } from '../types';
import { useBoard } from '../state/BoardContext';
import { BoardColumn } from './BoardColumn';
import styles from './Board.module.css';

export function Board() {
  const { dispatch, state } = useBoard();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = state.tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // over a column drop zone
    if (COLUMNS.includes(overId as ColumnId) && activeTask.column !== overId) {
      dispatch({ type: 'MOVE_TASK', payload: { id: activeId, column: overId as ColumnId } });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = state.tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Dropped over another task in the same column → reorder
    const overTask = state.tasks.find((t) => t.id === overId);
    if (overTask && overTask.column === activeTask.column && activeId !== overId) {
      dispatch({
        type: 'REORDER_TASKS',
        payload: { activeId, overId, column: activeTask.column },
      });
    }

    // Dropped over a different column
    if (COLUMNS.includes(overId as ColumnId) && activeTask.column !== overId) {
      dispatch({ type: 'MOVE_TASK', payload: { id: activeId, column: overId as ColumnId } });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board} role="main" aria-label="Task board">
        {COLUMNS.map((col) => (
          <BoardColumn key={col} columnId={col} />
        ))}
      </div>
    </DndContext>
  );
}
