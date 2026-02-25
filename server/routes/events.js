import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/ical/:token', async (req, res) => {
  try {
    const circleResult = await pool.query(
      'SELECT id, name FROM care_circles WHERE ical_token = $1',
      [req.params.token]
    );
    
    if (circleResult.rows.length === 0) {
      return res.status(404).send('Calendar not found');
    }
    
    const circle = circleResult.rows[0];
    const eventsResult = await pool.query(
      'SELECT * FROM events WHERE circle_id = $1 ORDER BY event_date, event_time',
      [circle.id]
    );
    
    const ical = generateICalendar(circle, eventsResult.rows);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${circle.name}.ics"`);
    res.send(ical);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:circleId/ical/token', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ical_token FROM care_circles WHERE id = $1',
      [req.params.circleId]
    );
    
    let token = result.rows[0]?.ical_token;
    
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      await pool.query(
        'UPDATE care_circles SET ical_token = $1 WHERE id = $2',
        [token, req.params.circleId]
      );
    }
    
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

router.put('/:circleId/:id', authenticateToken, async (req, res) => {
  try {
    const { title, event_date, event_time, location, notes } = req.body;
    const result = await pool.query(
      'UPDATE events SET title = $1, event_date = $2, event_time = $3, location = $4, notes = $5 WHERE id = $6 AND circle_id = $7 RETURNING *',
      [title, event_date, event_time, location, notes, req.params.id, req.params.circleId]
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

router.delete('/:circleId/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1 AND circle_id = $2', [req.params.id, req.params.circleId]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

function generateICalendar(circle, events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TheCareCircle//EN',
    `X-WR-CALNAME:${circle.name}`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];
  
  events.forEach(event => {
    const eventDate = new Date(event.event_date);
    const year = eventDate.getUTCFullYear();
    const month = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eventDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    let timeStr = '000000';
    let endTimeStr = '010000';
    if (event.event_time) {
      const timeParts = String(event.event_time).split(':');
      const hours = timeParts[0].padStart(2, '0');
      const minutes = timeParts[1].padStart(2, '0');
      timeStr = hours + minutes + '00';
      
      const endHour = (parseInt(hours) + 1) % 24;
      endTimeStr = String(endHour).padStart(2, '0') + minutes + '00';
    }
    
    const uid = `event-${event.id}@thecarecircle.com`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${dateStr}T${timeStr}`);
    lines.push(`DTEND:${dateStr}T${endTimeStr}`);
    lines.push(`SUMMARY:${event.title || 'Untitled Event'}`);
    if (event.location) lines.push(`LOCATION:${event.location}`);
    if (event.notes) lines.push(`DESCRIPTION:${event.notes}`);
    lines.push('END:VEVENT');
  });
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export default router;
