import express from 'express';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/pool.js';
import { generateAuthUrl, handleCallback, extractDocumentFields, getRequiredDocs } from '../services/digilocker.js';

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

router.post('/initiate', async (req, res, next) => {
  try {
    const { sessionId, schemeId } = req.body;
    if (!sessionId || !schemeId) return res.status(400).json({ error: 'Missing parameters' });

    const requiredDocs = getRequiredDocs(schemeId);
    const sessionToken = uuidv4();
    const authUrl = generateAuthUrl(sessionId, schemeId, requiredDocs);

    await pool.query(
      'INSERT INTO audit_log (session_id, event_type, scheme_id, document_types, consent_given) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, 'DIGILOCKER_CONSENT_INITIATED', schemeId, requiredDocs, false]
    );

    res.json({ authUrl, requiredDocs, sessionToken });
  } catch (error) {
    next(error);
  }
});

router.get('/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!state) return res.status(400).json({ error: 'Missing state parameter' });

    const stateObj = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    const { sessionId, schemeId } = stateObj;
    
    // sessionToken ideally should be passed via state or created here for demo
    const sessionToken = uuidv4(); 

    const docData = await handleCallback(code, state);
    const extractedFields = extractDocumentFields(docData);

    // Save only extracted fields in Redis with 1h TTL
    await redis.setex(`dl:${sessionToken}`, 3600, JSON.stringify(extractedFields));

    await pool.query(
      'INSERT INTO audit_log (session_id, event_type, scheme_id, consent_given) VALUES ($1, $2, $3, $4)',
      [sessionId, 'DIGILOCKER_CONSENT_COMPLETED', schemeId, true]
    );

    res.redirect(`http://localhost:5173/digilocker/callback?token=${sessionToken}`);
  } catch (error) {
    next(error);
  }
});

router.get('/status/:sessionToken', async (req, res, next) => {
  try {
    const data = await redis.get(`dl:${req.params.sessionToken}`);
    if (!data) return res.status(404).json({ error: 'Session not found or expired' });
    res.json({ fields: JSON.parse(data) });
  } catch (error) {
    next(error);
  }
});

router.delete('/session/:sessionToken', async (req, res, next) => {
  try {
    await redis.del(`dl:${req.params.sessionToken}`);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
