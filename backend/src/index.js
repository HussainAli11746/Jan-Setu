import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import { connectDB } from './db/db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import schemesRoutes from './routes/schemes.js';
import copilotRoutes from './routes/copilot.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  // Allow the Vite dev server, local prod, and the Chrome extension (all IDs)
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    // Allow Chrome / Edge / Brave extension origins
    if (!origin || allowed.includes(origin) || origin.startsWith('chrome-extension://') || origin.startsWith('extension://') || origin.startsWith('ms-browser-extension://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 25 });
app.use(generalLimiter);

// Health check
app.get(['/health', '/api/health', '/api'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// Routes (support both /api prefix and direct paths)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/chat', '/chat'], chatLimiter, chatRoutes);
app.use(['/api/schemes', '/schemes'], schemesRoutes);
app.use(['/api/copilot', '/copilot'], copilotRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`JanSetu backend running on port ${PORT}`);
  });
}

export default app;
