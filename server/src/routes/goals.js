import { Router } from 'express';
import db from '../database.js';

const router = Router();

/**
 * GET /api/goals
 * Get all goals for the logged-in user.
 */
router.get('/', (req, res) => {
  try {
    const goals = db.prepare(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.user.id);

    res.json({ goals });
  } catch (err) {
    console.error('Get goals error:', err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

/**
 * POST /api/goals
 * Create a new financial goal.
 */
router.post('/', (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline, priority } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({ error: 'name and target_amount are required' });
    }

    const result = db.prepare(`
      INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, priority)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      name,
      target_amount,
      current_amount || 0,
      deadline || null,
      priority || 'medium'
    );

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Goal created', goal });
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

/**
 * PUT /api/goals/:id
 * Update a goal.
 */
router.put('/:id', (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline, priority, status } = req.body;

    const existing = db.prepare(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    db.prepare(`
      UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, priority = ?, status = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      target_amount || existing.target_amount,
      current_amount !== undefined ? current_amount : existing.current_amount,
      deadline !== undefined ? deadline : existing.deadline,
      priority || existing.priority,
      status || existing.status,
      req.params.id
    );

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
    res.json({ message: 'Goal updated', goal });
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

/**
 * DELETE /api/goals/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM goals WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted' });
  } catch (err) {
    console.error('Delete goal error:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
