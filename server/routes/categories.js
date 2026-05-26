const router = require('express').Router();
const db = require('../db');

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY created_at DESC').all();
  res.json(categories);
});

router.post('/', (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (!color || !color.trim()) {
    return res.status(400).json({ error: 'color is required' });
  }
  try {
    const result = db
      .prepare('INSERT INTO categories (name, color) VALUES (?, ?)')
      .run(name.trim(), color.trim());
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(category);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'A category with that name already exists' });
    }
    throw err;
  }
});

router.delete('/:id', (req, res) => {
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
