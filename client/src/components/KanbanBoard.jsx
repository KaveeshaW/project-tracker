import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

const STATUSES = ['todo', 'in-progress', 'done'];

export default function KanbanBoard({ tasks, onDragEnd, onDelete }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
