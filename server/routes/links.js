import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT l.*, u.nickname FROM important_links l JOIN users u ON l.created_by = u.id WHERE l.circle_id = $1 ORDER BY l.created_at DESC',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const result = await pool.query(
      'INSERT INTO important_links (circle_id, title, url, description, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.circleId, title, url, description, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:circleId/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM important_links WHERE id = $1 AND circle_id = $2', [req.params.id, req.params.circleId]);
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
