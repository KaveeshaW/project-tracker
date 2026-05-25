import { useState } from 'react';

export default function ProjectSelector({ projects, activeProjectId, onSelect, onCreate }) {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      await onCreate(newName.trim());
      setNewName('');
      setCreating(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="project-selector">
      <select
        value={activeProjectId ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
      >
        <option value="" disabled>Select a project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {creating ? (
        <form onSubmit={handleCreate}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => { setCreating(false); setError(''); }}>Cancel</button>
          {error && <span className="error">{error}</span>}
        </form>
      ) : (
        <button onClick={() => setCreating(true)}>+ New Project</button>
      )}
    </div>
  );
}
