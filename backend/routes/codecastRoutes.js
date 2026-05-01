import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, async (req, res) => {
  try {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    res.json({ roomId, message: 'CodeCast room created' });
  } catch {
    res.status(500).json({ error: 'Failed to start CodeCast' });
  }
});

router.post('/stop', protect, async (req, res) => {
  try {
    res.json({ message: 'CodeCast stopped' });
  } catch {
    res.status(500).json({ error: 'Failed to stop CodeCast' });
  }
});

export default router;
