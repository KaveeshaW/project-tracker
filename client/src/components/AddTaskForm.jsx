import { useState } from 'react';

export default function AddTaskForm({ disabled, onAdd, categories }) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    try {
      await onAdd(title.trim(), categoryId ? Number(categoryId) : null);
      setTitle('');
      setCategoryId('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task title"
        disabled={disabled}
      />
      {categories && categories.length > 0 && (
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={disabled}
          className="category-select"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
      <button type="submit" disabled={disabled || !title.trim()}>Add Task</button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}
