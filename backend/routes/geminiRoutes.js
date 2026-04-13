import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { chatWithGemini, analyzeComplexity } from '../utils/gemini.js';

const router = express.Router();

router.post('/chat', protect, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required.' });
  try {
    const response = await chatWithGemini(prompt);
    res.json({ response });
  } catch (error) {
    let details = 'Unknown error occurred.';
    if (error.status === 429) {
      details = 'AI Quota exceeded. Please try again later or check your API key billing.';
    } else if (error.message) {
      try { const parsed = JSON.parse(error.message); details = parsed.error?.message || error.message; }
      catch (e) { details = error.message; }
    }
    console.error('FULL GEMINI ERROR:', error);
    res.status(error.status === 429 ? 429 : 500).json({ error: 'Gemini chat failed.', details });
  }
});

router.post('/analyze-complexity', protect, async (req, res) => {
  const { code } = req.body;
  if (!code || code.trim().length === 0) {
    return res.json({ time: "O(?)", space: "O(?)" });
  }
  const result = await analyzeComplexity(code);
  res.json(result);
});

export default router;
