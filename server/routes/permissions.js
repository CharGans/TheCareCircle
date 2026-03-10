import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get permissions for a member
router.get('/:circleId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM member_permissions WHERE circle_id = $1 AND user_id = $2',
      [req.params.circleId, req.params.userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        can_view_calendar: true,
        can_view_messages: true,
        can_view_careplan: false,
        can_view_checklist: true,
        can_view_providers: false,
        can_view_members: false,
        can_view_links: false
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update permissions for a member
router.put('/:circleId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { circleId, userId } = req.params;
    const permissions = req.body;
    
    // Check if requester is owner
    const roleCheck = await pool.query(
      'SELECT role FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, req.user.id]
    );
    
    if (roleCheck.rows[0]?.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can modify permissions' });
    }
    
    // Upsert permissions
    const result = await pool.query(
      `INSERT INTO member_permissions 
       (circle_id, user_id, can_view_calendar, can_view_messages, can_view_careplan, 
        can_view_checklist, can_view_providers, can_view_members, can_view_links, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       ON CONFLICT (circle_id, user_id) 
       DO UPDATE SET 
         can_view_calendar = $3,
         can_view_messages = $4,
         can_view_careplan = $5,
         can_view_checklist = $6,
         can_view_providers = $7,
         can_view_members = $8,
         can_view_links = $9,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        circleId,
        userId,
        permissions.can_view_calendar ?? true,
        permissions.can_view_messages ?? true,
        permissions.can_view_careplan ?? true,
        permissions.can_view_checklist ?? true,
        permissions.can_view_providers ?? true,
        permissions.can_view_members ?? true,
        permissions.can_view_links !== undefined ? permissions.can_view_links : false
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user's permissions
router.get('/:circleId/my-permissions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM member_permissions WHERE circle_id = $1 AND user_id = $2',
      [req.params.circleId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({
        can_view_calendar: true,
        can_view_messages: true,
        can_view_careplan: false,
        can_view_checklist: true,
        can_view_providers: false,
        can_view_members: false,
        can_view_links: false
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
