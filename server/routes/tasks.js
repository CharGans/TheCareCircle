import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT t.*, u.nickname as completed_by_name FROM tasks t LEFT JOIN users u ON t.completed_by = u.id WHERE t.circle_id = $1 ORDER BY t.completed, t.created_at',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (circle_id, title) VALUES ($1, $2) RETURNING *',
      [req.params.circleId, title]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:circleId/:id', authenticateToken, async (req, res) => {
  try {
    const { completed } = req.body;
    await pool.query(
      'UPDATE tasks SET completed = $1, completed_by = $2, completed_at = $3 WHERE id = $4',
      [completed, completed ? req.user.id : null, completed ? new Date() : null, req.params.id]
    );
    res.json({ message: 'Task updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
