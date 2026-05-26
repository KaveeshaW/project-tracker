import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, onDelete, onEdit, categories }) {
  const category = categories?.find((c) => c.id === task.category_id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function startEdit() {
    setDraft(task.title);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft('');
  }

  function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === task.title) {
      cancelEdit();
      return;
    }
    onEdit(task.id, trimmed);
    setEditing(false);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Enter') saveEdit();
    else cancelEdit();
  }

  return (
    <Draggable draggableId={String(task.id)} index={index} isDragDisabled={editing}>
      {(provided, snapshot) => (
        <div
          className={`task-card${snapshot.isDragging ? ' dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(editing ? {} : provided.dragHandleProps)}
        >
          {editing ? (
            <>
              <input
                className="task-edit-input"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="task-edit-actions">
                <button
                  className="save-btn"
                  onClick={saveEdit}
                  disabled={!draft.trim() || draft.trim() === task.title}
                >
                  Save
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="task-title-row">
                {category && (
                  <span className="task-cat-dot" style={{ background: category.color }} title={category.name} />
                )}
                <span>{task.title}</span>
              </div>
              <div className="task-actions">
                <button className="edit-btn" onClick={startEdit}>✏</button>
                <button className="delete-btn" onClick={() => onDelete(task.id)}>✕</button>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}
