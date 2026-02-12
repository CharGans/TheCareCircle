import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:circleId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM healthcare_providers WHERE circle_id = $1 ORDER BY name',
      [req.params.circleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:circleId', authenticateToken, async (req, res) => {
  try {
    const { name, specialty, phone, hospital } = req.body;
    const result = await pool.query(
      'INSERT INTO healthcare_providers (circle_id, name, specialty, phone, hospital) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.params.circleId, name, specialty, phone, hospital]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
