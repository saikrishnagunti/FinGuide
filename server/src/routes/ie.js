import { Router } from 'express';
import { getDb } from '../database.js';

const router = Router();

/**
 * GET /api/ie/snapshots
 */
router.get('/snapshots', (req, res) => {
  try {
    const db = getDb();
    const { year, month } = req.query;
    let query = 'SELECT * FROM ie_snapshots WHERE user_id = ?';
    const params = [req.user.id];

    if (year) { query += ' AND year = ?'; params.push(parseInt(year)); }
    if (month) { query += ' AND month = ?'; params.push(parseInt(month)); }
    query += ' ORDER BY year DESC, month DESC';

    const snapshots = db.all(query, ...params);
    const parsed = snapshots.map(s => ({
      ...s,
      income_data: JSON.parse(s.income_data),
      expense_data: JSON.parse(s.expense_data),
    }));

    res.json({ snapshots: parsed });
  } catch (err) {
    console.error('Get snapshots error:', err);
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
});

/**
 * GET /api/ie/snapshots/:id
 */
router.get('/snapshots/:id', (req, res) => {
  try {
    const db = getDb();
    const snapshot = db.get(
      'SELECT * FROM ie_snapshots WHERE id = ? AND user_id = ?',
      parseInt(req.params.id), req.user.id
    );
    if (!snapshot) return res.status(404).json({ error: 'Snapshot not found' });

    res.json({
      snapshot: { ...snapshot, income_data: JSON.parse(snapshot.income_data), expense_data: JSON.parse(snapshot.expense_data) },
    });
  } catch (err) {
    console.error('Get snapshot error:', err);
    res.status(500).json({ error: 'Failed to fetch snapshot' });
  }
});

/**
 * POST /api/ie/snapshots
 */
router.post('/snapshots', (req, res) => {
  try {
    const db = getDb();
    const { month, year, income_data, expense_data, notes } = req.body;

    if (!month || !year || !income_data || !expense_data) {
      return res.status(400).json({ error: 'month, year, income_data, and expense_data are required' });
    }

    const totalIncome = Object.values(income_data).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const totalExpenses = Object.values(expense_data).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const netSavings = totalIncome - totalExpenses;

    const existing = db.get(
      'SELECT id FROM ie_snapshots WHERE user_id = ? AND month = ? AND year = ?',
      req.user.id, month, year
    );

    let snapshotId;
    if (existing) {
      db.run(
        `UPDATE ie_snapshots SET income_data = ?, expense_data = ?, total_income = ?, total_expenses = ?, net_savings = ?, notes = ? WHERE id = ?`,
        JSON.stringify(income_data), JSON.stringify(expense_data), totalIncome, totalExpenses, netSavings, notes || null, existing.id
      );
      snapshotId = existing.id;
    } else {
      const result = db.run(
        `INSERT INTO ie_snapshots (user_id, month, year, income_data, expense_data, total_income, total_expenses, net_savings, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        req.user.id, month, year, JSON.stringify(income_data), JSON.stringify(expense_data), totalIncome, totalExpenses, netSavings, notes || null
      );
      snapshotId = result.lastInsertRowid;
    }

    const snapshot = db.get('SELECT * FROM ie_snapshots WHERE id = ?', snapshotId);

    res.status(201).json({
      message: existing ? 'Snapshot updated' : 'Snapshot created',
      snapshot: { ...snapshot, income_data: JSON.parse(snapshot.income_data), expense_data: JSON.parse(snapshot.expense_data) },
    });
  } catch (err) {
    console.error('Create snapshot error:', err);
    res.status(500).json({ error: 'Failed to save snapshot' });
  }
});

/**
 * DELETE /api/ie/snapshots/:id
 */
router.delete('/snapshots/:id', (req, res) => {
  try {
    const db = getDb();
    const result = db.run(
      'DELETE FROM ie_snapshots WHERE id = ? AND user_id = ?',
      parseInt(req.params.id), req.user.id
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Snapshot not found' });
    res.json({ message: 'Snapshot deleted' });
  } catch (err) {
    console.error('Delete snapshot error:', err);
    res.status(500).json({ error: 'Failed to delete snapshot' });
  }
});

export default router;
