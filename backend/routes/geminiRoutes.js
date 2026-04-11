const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { chatWithGemini } = require('../utils/gemini');

router.post('/chat', protect, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required.' });
  try {
    const response = await chatWithGemini(prompt);
    res.json({ response });
  } catch (error) {
    // Print the full error object for debugging
    console.error('FULL GEMINI ERROR:', error?.response?.data || error?.message || error);
    res.status(500).json({
      error: 'Gemini chat failed.',
      details: error?.response?.data || error?.message || error,
      suggestion: 'Check API key or safety filters.'
    });
  }
});

module.exports = router;
