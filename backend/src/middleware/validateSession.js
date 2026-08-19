import pool from '../db/pool.js';

export const validateSession = async (req, res, next) => {
  const sessionId = req.body.sessionId || req.query.sessionId || req.headers['x-session-id'];
  if (!sessionId) {
    return res.status(401).json({ error: 'Session ID is required' });
  }

  try {
    const result = await pool.query('SELECT * FROM user_sessions WHERE session_id = $1', [sessionId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    req.session = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};
