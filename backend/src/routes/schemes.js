import express from 'express';
import pool from '../db/pool.js';
import { matchSchemes } from '../services/rulesEngine.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM schemes WHERE is_active = true';
    let params = [];
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM schemes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/match', async (req, res, next) => {
  try {
    const { profile } = req.body;
    if (!profile) return res.status(400).json({ error: 'Profile is required' });
    const matched = await matchSchemes(profile);
    res.json({ schemes: matched });
  } catch (error) {
    next(error);
  }
});

export default router;
