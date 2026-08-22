import express from 'express';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { matchProfileSchemesWithGemini } from '../services/gemini.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language = 'en' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      language,
      profile: { language },
      savedSchemes: [],
    });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        profile: user.profile,
        savedSchemes: user.savedSchemes || [],
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language || user.profile?.language || 'en',
        profile: user.profile,
        savedSchemes: user.savedSchemes || [],
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me — protected
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let matchedSchemes = user.matchedSchemes || [];
    if (matchedSchemes.length === 0 && user.profile && (user.profile.occupation || user.profile.state)) {
      matchedSchemes = await matchProfileSchemesWithGemini(user.profile, user.language || 'en');
      user.matchedSchemes = matchedSchemes;
      await user.save();
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      language: user.language || user.profile?.language || 'en',
      profile: user.profile,
      savedSchemes: user.savedSchemes || [],
      matchedSchemes,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/auth/profile — save onboarding profile with language and generate matched schemes with Gemini
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { ageCategory, gender, state, incomeBracket, occupation, employmentStatus, language } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const currentProfile = user.profile || {};
    const updatedLanguage = language || currentProfile.language || user.language || 'en';

    user.language = updatedLanguage;
    user.profile = {
      ...currentProfile,
      language: updatedLanguage,
      ...(ageCategory !== undefined && { ageCategory }),
      ...(gender !== undefined && { gender }),
      ...(state !== undefined && { state }),
      ...(incomeBracket !== undefined && { incomeBracket }),
      ...(occupation !== undefined && { occupation }),
      ...(employmentStatus !== undefined && { employmentStatus }),
      onboardingComplete: true,
    };

    // Generate AI matched schemes with Gemini based on updated profile
    const matchedSchemes = await matchProfileSchemesWithGemini(user.profile, user.language);
    user.matchedSchemes = matchedSchemes;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      language: user.language,
      profile: user.profile,
      savedSchemes: user.savedSchemes || [],
      matchedSchemes: user.matchedSchemes || [],
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/auth/matched-schemes — retrieve or refresh AI matched schemes for authenticated user
router.get('/matched-schemes', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const matchedSchemes = await matchProfileSchemesWithGemini(user.profile || {}, user.language || 'en');
    user.matchedSchemes = matchedSchemes;
    await user.save();

    res.json({ matchedSchemes });
  } catch (err) {
    console.error('Failed to get matched schemes:', err);
    res.status(500).json({ error: 'Failed to get matched schemes' });
  }
});

// PATCH /api/auth/language — quickly update language in DB
router.patch('/language', verifyToken, async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) return res.status(400).json({ error: 'Language is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.language = language;
    if (user.profile) {
      user.profile.language = language;
    }
    await user.save();

    res.json({
      id: user._id,
      language: user.language,
      profile: user.profile,
      savedSchemes: user.savedSchemes || [],
    });
  } catch (err) {
    console.error('Language update error:', err);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// GET /api/auth/saved-schemes — retrieve all saved schemes
router.get('/saved-schemes', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.savedSchemes || []);
  } catch (err) {
    console.error('Failed to get saved schemes:', err);
    res.status(500).json({ error: 'Failed to get saved schemes' });
  }
});

// POST /api/auth/saved-schemes — save a scheme
router.post('/saved-schemes', verifyToken, async (req, res) => {
  try {
    const { scheme } = req.body;
    if (!scheme || !scheme.id) {
      return res.status(400).json({ error: 'Scheme data is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if already saved
    const exists = user.savedSchemes.some(s => s.id === scheme.id);
    if (!exists) {
      user.savedSchemes.push({
        id: scheme.id,
        name: scheme.name || scheme.shortName || 'Government Scheme',
        shortName: scheme.shortName,
        ministry: scheme.ministry,
        category: scheme.category || 'social',
        description: scheme.description,
        benefit: scheme.benefit,
        eligibility: scheme.eligibility || [],
        requiredDocs: scheme.requiredDocs || [],
        applyUrl: scheme.applyUrl,
        savedAt: new Date(),
      });
      await user.save();
    }

    res.json({ success: true, savedSchemes: user.savedSchemes });
  } catch (err) {
    console.error('Failed to save scheme:', err);
    res.status(500).json({ error: 'Failed to save scheme' });
  }
});

// DELETE /api/auth/saved-schemes/:schemeId — remove a saved scheme
router.delete('/saved-schemes/:schemeId', verifyToken, async (req, res) => {
  try {
    const { schemeId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.savedSchemes = user.savedSchemes.filter(s => s.id !== schemeId);
    await user.save();

    res.json({ success: true, savedSchemes: user.savedSchemes });
  } catch (err) {
    console.error('Failed to remove saved scheme:', err);
    res.status(500).json({ error: 'Failed to remove saved scheme' });
  }
});

export default router;
