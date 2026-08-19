import express from 'express';
import Redis from 'ioredis';
import pool from '../db/pool.js';
import { fillFormFields } from '../services/autoFill.js';

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const generateReferenceNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `JANSETU-${date}-${randomStr}`;
};

router.post('/submit', async (req, res, next) => {
  try {
    const { sessionId, schemeId, sessionToken } = req.body;
    if (!sessionId || !schemeId || !sessionToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const redisData = await redis.get(`dl:${sessionToken}`);
    const extractedFields = redisData ? JSON.parse(redisData) : {};

    const { filled } = fillFormFields(schemeId, extractedFields);
    const referenceNumber = generateReferenceNumber();
    const statusHistory = [{ status: 'submitted', timestamp: new Date().toISOString() }];

    const result = await pool.query(
      `INSERT INTO applications 
      (session_id, scheme_id, status, reference_number, form_data, status_history) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [sessionId, schemeId, 'submitted', referenceNumber, JSON.stringify(filled), JSON.stringify(statusHistory)]
    );

    await pool.query(
      'INSERT INTO audit_log (session_id, event_type, scheme_id, metadata) VALUES ($1, $2, $3, $4)',
      [sessionId, 'APPLICATION_SUBMITTED', schemeId, JSON.stringify({ referenceNumber })]
    );

    await redis.del(`dl:${sessionToken}`);

    res.json({
      applicationId: result.rows[0].id,
      referenceNumber,
      status: 'submitted',
      scheme: schemeId
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM applications WHERE session_id = $1', [req.params.sessionId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const appResult = await pool.query('SELECT status_history FROM applications WHERE id = $1', [req.params.id]);
    if (appResult.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
    
    const history = typeof appResult.rows[0].status_history === 'string' 
      ? JSON.parse(appResult.rows[0].status_history) 
      : appResult.rows[0].status_history;
      
    history.push({ status, timestamp: new Date().toISOString() });

    const result = await pool.query(
      'UPDATE applications SET status = $1, status_history = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, JSON.stringify(history), req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
