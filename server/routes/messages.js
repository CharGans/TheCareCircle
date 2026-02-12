import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.nickname FROM messages m JOIN users u ON m.user_id = u.id WHERE m.circle_id = $1 ORDER BY m.created_at',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (circle_id, user_id, message) VALUES ($1, $2, $3) RETURNING *',
      [req.params.circleId, req.user.id, message]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:circleId/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1 AND user_id = $2 AND circle_id = $3', [req.params.id, req.user.id, req.params.circleId]);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
