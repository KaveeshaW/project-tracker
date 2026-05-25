import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, onDelete }) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task-card${snapshot.isDragging ? ' dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <span>{task.title}</span>
          <button className="delete-btn" onClick={() => onDelete(task.id)}>✕</button>
        </div>
      )}
    </Draggable>
  );
}
