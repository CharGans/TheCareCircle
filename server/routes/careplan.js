import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:circleId/medications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medications WHERE circle_id = $1 ORDER BY created_at',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId/medications', authenticateToken, async (req, res) => {
  try {
    const { name, dosage, schedule, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO medications (circle_id, name, dosage, schedule, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.circleId, name, dosage, schedule, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:circleId/notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT cn.*, u.nickname FROM care_notes cn JOIN users u ON cn.created_by = u.id WHERE cn.circle_id = $1 ORDER BY cn.created_at DESC',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId/notes', authenticateToken, async (req, res) => {
  try {
    const { note } = req.body;
    const result = await pool.query(
      'INSERT INTO care_notes (circle_id, note, created_by) VALUES ($1, $2, $3) RETURNING *',
      [req.params.circleId, note, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
