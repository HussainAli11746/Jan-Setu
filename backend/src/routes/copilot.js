import express from "express";
import { rateLimit } from "express-rate-limit";
import { verifyToken } from "../middleware/auth.js";
import { analyzeScreenshot } from "../services/copilotService.js";

const router = express.Router();

// Generous rate limit (60 calls / min per IP) so rapid testing never gets blocked
const copilotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.userId || req.ip,
  message: { error: "Analysis request limit reached. Please wait a moment before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/copilot/analyze
 * Body: { schemeId: string, imageBase64: string, lang?: string }
 * Auth: Bearer <JWT>
 */
router.post("/analyze", verifyToken, copilotLimiter, async (req, res) => {
  try {
    const { schemeId, imageBase64, lang = "en" } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "imageBase64 screenshot data is required." });
    }

    const result = await analyzeScreenshot({ schemeId, imageBase64, lang });
    res.json(result);
  } catch (err) {
    console.error("[copilot/analyze] Handler Error:", err.message || err);
    res.status(500).json({ error: err.message || "Failed to analyze screenshot." });
  }
});

export default router;