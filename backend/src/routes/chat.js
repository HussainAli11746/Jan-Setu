import express from 'express';
import multer from 'multer';
import pool from '../db/pool.js';
import { extractUserProfile, generateResponse } from '../services/claude.js';
import { matchSchemes } from '../services/rulesEngine.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Resilient in-memory session cache
const memorySessions = new Map();

router.post('/', async (req, res, next) => {
  try {
    let { sessionId, message, language = 'en', profile: clientProfile = {}, lastAskedField = null } = req.body;
    let step = 1;
    let history = [];

    if (!sessionId) {
      sessionId = uuidv4();
    }

    // Retrieve previous profile from in-memory cache or DB
    let currentProfile = memorySessions.get(sessionId) || clientProfile || {};

    try {
      const result = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [sessionId]);
      if (result.rows.length > 0) {
        currentProfile = { ...result.rows[0].user_profile, ...currentProfile };
        step = result.rows[0].current_step || step;
      } else {
        await pool.query(
          'INSERT INTO user_sessions (session_id, language, current_step, user_profile) VALUES ($1, $2, $3, $4) ON CONFLICT (session_id) DO NOTHING',
          [sessionId, language, 1, currentProfile]
        );
      }
    } catch (dbErr) {
      console.warn("Database user_sessions sync warning:", dbErr.message);
    }

    // Extract newly provided entities with context of lastAskedField
    const newProfileData = await extractUserProfile(message, language, history, lastAskedField);
    const mergedProfile = { ...currentProfile, ...newProfileData };

    // Update memory session cache
    memorySessions.set(sessionId, mergedProfile);

    let matchedSchemes = [];
    if (Object.keys(mergedProfile).length >= 2) {
      try {
        matchedSchemes = await matchSchemes(mergedProfile);
        if (matchedSchemes.length > 0) {
          step = Math.max(step, 2);
        }
      } catch (err) {
        console.warn("Scheme matching failed:", err.message);
      }
    }

    try {
      await pool.query(
        'UPDATE user_sessions SET user_profile = $1, current_step = $2, matched_scheme_ids = $3, updated_at = NOW() WHERE session_id = $4',
        [mergedProfile, step, matchedSchemes.map(s => s.id), sessionId]
      );
    } catch (dbErr) {
      // Ignored
    }

    const responseObj = await generateResponse(message, mergedProfile, matchedSchemes, language, step, lastAskedField);

    res.json({
      reply: typeof responseObj === 'string' ? responseObj : responseObj.reply,
      isComplete: responseObj.isComplete || false,
      nextField: responseObj.nextField || null,
      missingFields: responseObj.missingFields || [],
      relevantSchemes: responseObj.relevantSchemes || [],
      profile: mergedProfile,
      step,
      schemes: matchedSchemes,
      sessionId
    });
  } catch (error) {
    next(error);
  }
});

router.post('/transcribe', upload.single('audio'), (req, res) => {
  res.json({ text: 'मैं उत्तर प्रदेश का किसान हूं, मेरी आय 80,000 रुपये सालाना है' });
});

export default router;
