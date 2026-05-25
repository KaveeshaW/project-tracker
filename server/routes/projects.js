const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const result = db.prepare('INSERT INTO projects (name) VALUES (?)').run(name.trim());
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(project);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A project with that name already exists' });
    }
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  db.transaction(() => {
    db.prepare('DELETE FROM tasks WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  })();
  res.json({ ok: true });
});

module.exports = router;
