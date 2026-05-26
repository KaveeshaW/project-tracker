import { useState } from 'react';

const PRESET_COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
];

export default function CategoryManager({ categories, onCreate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      await onCreate(name.trim(), color);
      setName('');
      setColor(PRESET_COLORS[0]);
      setOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <span className="category-manager-label">Categories</span>
        <button className="category-toggle-btn" onClick={() => { setOpen((v) => !v); setError(''); }}>
          {open ? 'Cancel' : '+ New'}
        </button>
      </div>

      <div className="category-chips">
        {categories.map((c) => (
          <span key={c.id} className="category-chip">
            <span className="chip-dot" style={{ background: c.color }} />
            {c.name}
            <button
              className="chip-delete"
              onClick={() => onDelete(c.id)}
              title="Delete category"
            >✕</button>
          </span>
        ))}
        {categories.length === 0 && !open && (
          <span className="category-empty-hint">No categories yet</span>
        )}
      </div>

      {open && (
        <form className="category-create-form" onSubmit={handleCreate}>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
          <div className="color-swatches">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch${color === c ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <button type="submit" disabled={!name.trim()}>Create</button>
          {error && <span className="error">{error}</span>}
        </form>
      )}
    </div>
  );
}
