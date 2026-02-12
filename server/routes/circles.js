import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO care_circles (name, owner_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );
    
    await pool.query(
      'INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, req.user.id, 'owner']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.* FROM care_circles c JOIN circle_members cm ON c.id = cm.circle_id WHERE cm.user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.nickname, u.email, cm.role FROM users u JOIN circle_members cm ON u.id = cm.user_id WHERE cm.circle_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await pool.query(
      'INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, userResult.rows[0].id, role || 'member']
    );
    
    res.json({ message: 'Member added' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;
    await pool.query(
      'UPDATE circle_members SET role = $1 WHERE circle_id = $2 AND user_id = $3',
      [role, req.params.id, req.params.userId]
    );
    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [req.params.id, req.params.userId]
    );
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
