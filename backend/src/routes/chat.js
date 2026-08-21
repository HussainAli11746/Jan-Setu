import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { suggestSchemes } from '../services/gemini.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/chat — protected
router.post('/', verifyToken, async (req, res) => {
  try {
    const { message, profile, language = 'en', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Auto-fetch and merge stored citizen profile from MongoDB
    let enrichedProfile = profile || {};
    if (req.userId) {
      try {
        const user = await User.findById(req.userId);
        if (user) {
          enrichedProfile = {
            name: user.name,
            state: user.profile?.state || 'India',
            occupation: user.profile?.occupation || 'Citizen',
            incomeBracket: user.profile?.incomeBracket || 'Not specified',
            ageCategory: user.profile?.ageCategory || 'Adult',
            gender: user.profile?.gender || 'Not specified',
            employmentStatus: user.profile?.employmentStatus || 'Not specified',
            ...enrichedProfile,
          };
        }
      } catch (err) {
        console.warn('Failed to fetch user from DB for chat context:', err.message);
      }
    }

    const result = await suggestSchemes(message, enrichedProfile, language, history);

    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

export default router;
