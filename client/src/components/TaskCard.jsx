import { useEffect, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, onDelete, onEdit, onSetCategory, categories }) {
  const category = categories?.find((c) => c.id === task.category_id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftCategoryId, setDraftCategoryId] = useState('');

  // Register Escape at capture phase so it fires before @hello-pangea/dnd's
  // global keyboard sensor, which otherwise intercepts Escape first.
  useEffect(() => {
    if (!editing) return;
    function onEscape(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        cancelEdit();
      }
    }
    document.addEventListener('keydown', onEscape, true);
    return () => document.removeEventListener('keydown', onEscape, true);
  }, [editing]);

  function startEdit() {
    setDraft(task.title);
    setDraftCategoryId(task.category_id != null ? String(task.category_id) : '');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setDraft('');
    setDraftCategoryId('');
  }

  function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) { cancelEdit(); return; }

    const newCatId = draftCategoryId === '' ? null : Number(draftCategoryId);
    const titleChanged = trimmed !== task.title;
    const categoryChanged = newCatId !== (task.category_id ?? null);

    if (!titleChanged && !categoryChanged) { cancelEdit(); return; }

    if (titleChanged) onEdit(task.id, trimmed);
    if (categoryChanged) onSetCategory(task.id, newCatId);

    setEditing(false);
    setDraft('');
    setDraftCategoryId('');
  }

  function handleKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    e.stopPropagation();
    saveEdit();
  }

  const trimmed = draft.trim();
  const newCatId = draftCategoryId === '' ? null : Number(draftCategoryId);
  const saveDisabled = !trimmed ||
    (trimmed === task.title && newCatId === (task.category_id ?? null));

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
              <div className="task-edit-fields">
                <input
                  className="task-edit-input"
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {categories && categories.length > 0 && (
                  <select
                    className="task-cat-select"
                    value={draftCategoryId}
                    onChange={(e) => setDraftCategoryId(e.target.value)}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="task-edit-actions">
                <button className="save-btn" onClick={saveEdit} disabled={saveDisabled}>
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
