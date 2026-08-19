import express from 'express';
import multer from 'multer';
import pool from '../db/pool.js';
import { extractUserProfile, generateResponse } from '../services/claude.js';
import { matchSchemes } from '../services/rulesEngine.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', async (req, res, next) => {
  try {
    let { sessionId, message, language = 'en' } = req.body;
    let session;
    let step = 1;
    let history = [];

    if (sessionId) {
      const result = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [sessionId]);
      if (result.rows.length > 0) {
        session = result.rows[0];
        step = session.current_step;
      }
    }

    if (!session) {
      sessionId = uuidv4();
      const result = await pool.query(
        'INSERT INTO user_sessions (session_id, language, current_step) VALUES ($1, $2, $3) RETURNING *',
        [sessionId, language, 1]
      );
      session = result.rows[0];
    }

    const currentProfile = session.user_profile || {};
    const newProfileData = await extractUserProfile(message, language, history);
    const mergedProfile = { ...currentProfile, ...newProfileData };

    let matchedSchemes = [];
    if (Object.keys(mergedProfile).length > 2) {
      matchedSchemes = await matchSchemes(mergedProfile);
      if (matchedSchemes.length > 0) {
        step = Math.max(step, 2);
      }
    }

    await pool.query(
      'UPDATE user_sessions SET user_profile = $1, current_step = $2, matched_scheme_ids = $3, updated_at = NOW() WHERE session_id = $4',
      [mergedProfile, step, matchedSchemes.map(s => s.id), sessionId]
    );

    const reply = await generateResponse(message, mergedProfile, matchedSchemes, language, step);

    res.json({ reply, step, schemes: step >= 2 ? matchedSchemes : [], sessionId });
  } catch (error) {
    next(error);
  }
});

router.post('/transcribe', upload.single('audio'), (req, res) => {
  // Mock transcription
  res.json({ text: 'मैं उत्तर प्रदेश का किसान हूं, मेरी आय 80,000 रुपये सालाना है' });
});

export default router;
