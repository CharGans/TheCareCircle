import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT e.*, u.nickname as responsible_name FROM events e LEFT JOIN users u ON e.responsible_user_id = u.id WHERE e.circle_id = $1 ORDER BY e.event_date, e.event_time',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { title, event_date, event_time, location, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO events (circle_id, title, event_date, event_time, location, notes, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.params.circleId, title, event_date, event_time, location, notes, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:circleId/:id/claim', authenticateToken, async (req, res) => {
  try {
    const { unclaim } = req.body;
    if (unclaim) {
      await pool.query(
        'UPDATE events SET responsible_user_id = NULL WHERE id = $1',
        [req.params.id]
      );
      res.json({ message: 'Event unclaimed' });
    } else {
      await pool.query(
        'UPDATE events SET responsible_user_id = $1 WHERE id = $2',
        [req.user.id, req.params.id]
      );
      res.json({ message: 'Event claimed' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
