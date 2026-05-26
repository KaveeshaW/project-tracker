import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

const STATUSES = ['todo', 'in-progress', 'done'];

export default function KanbanBoard({ tasks, onDragEnd, onDelete, onEdit, onSetCategory, activeFilter, categories }) {
  const visibleTasks = activeFilter != null
    ? tasks.filter((t) => t.category_id === activeFilter)
    : tasks;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {activeFilter != null && (
        <p className="filter-notice">
          Showing: <strong>{categories.find((c) => c.id === activeFilter)?.name}</strong>
          {' '}— click the category ring again to clear
        </p>
      )}
      <div className="kanban-board">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={visibleTasks.filter((t) => t.status === status)}
            onDelete={onDelete}
            onEdit={onEdit}
            onSetCategory={onSetCategory}
            categories={categories}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
