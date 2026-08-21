import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { suggestSchemes } from '../services/gemini.js';

const router = express.Router();

// POST /api/chat — protected
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, profile, language = 'en' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await suggestSchemes(message, profile || {}, language);

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

export default router;
