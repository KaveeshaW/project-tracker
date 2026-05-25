import { useState } from 'react';

export default function AddTaskForm({ disabled, onAdd }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    try {
      await onAdd(title.trim());
      setTitle('');
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
      <button type="submit" disabled={disabled || !title.trim()}>Add Task</button>
      {error && <span className="error">{error}</span>}
    </form>
  );
}
