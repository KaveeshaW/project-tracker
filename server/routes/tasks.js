const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }
  const tasks = db
    .prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC')
    .all(projectId);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { projectId, title } = req.body;
  if (!projectId || !title || !title.trim()) {
    return res.status(400).json({ error: 'projectId and title are required' });
  }
  const result = db
    .prepare('INSERT INTO tasks (project_id, title) VALUES (?, ?)')
    .run(projectId, title.trim());
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(task);
});

router.patch('/:id', (req, res) => {
  const { status, title } = req.body;

  if (title !== undefined) {
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    const result = db
      .prepare('UPDATE tasks SET title = ? WHERE id = ?')
      .run(title.trim(), req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    return res.json(task);
  }

  const validStatuses = ['todo', 'in-progress', 'done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }
  const result = db
    .prepare('UPDATE tasks SET status = ? WHERE id = ?')
    .run(status, req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ ok: true });
});

module.exports = router;
