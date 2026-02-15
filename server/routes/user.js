import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.put('/nickname', authenticateToken, async (req, res) => {
  try {
    const { nickname } = req.body;
    await pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [nickname, req.user.id]);
    const result = await pool.query('SELECT id, email, nickname FROM users WHERE id = $1', [req.user.id]);
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
