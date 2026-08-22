import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jansetu_super_secret_key_2024';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'guest' && token !== 'undefined' && token !== 'null') {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
      } catch {
        req.userId = null;
      }
    }
  }
  next();
};
