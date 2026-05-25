import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const LABELS = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export default function Column({ status, tasks, onDelete }) {
  return (
    <div className="column">
      <h2 className="column-title">{LABELS[status]}</h2>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            className={`task-list${snapshot.isDraggingOver ? ' drag-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onDelete={onDelete} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
