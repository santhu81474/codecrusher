const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// CodeCast sessions are managed via Socket.io in server.js
// These REST endpoints handle session metadata

router.post('/start', protect, async (req, res) => {
  try {
    const roomId = `cast_${req.user.id}_${Date.now()}`;
    res.json({ roomId, message: 'CodeCast session started' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start CodeCast session' });
  }
});

router.post('/stop', protect, async (req, res) => {
  try {
    res.json({ message: 'CodeCast session stopped' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop CodeCast session' });
  }
});

module.exports = router;
