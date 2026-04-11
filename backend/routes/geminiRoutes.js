const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithGemini, analyzeComplexity } = require('../utils/gemini');

router.post('/chat', protect, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required.' });
  try {
    const response = await chatWithGemini(prompt);
    res.json({ response });
  } catch (error) {
    console.error('FULL GEMINI ERROR:', error?.response?.data || error?.message || error);
    res.status(500).json({ error: 'Gemini chat failed.', details: error?.message });
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

module.exports = router;
