const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// ChallengeRoom model
let ChallengeRoom;
try {
  ChallengeRoom = require('../models/ChallengeRoom');
} catch (e) {
  // Model will be created later
}

// Create a challenge room
router.post('/create', protect, async (req, res) => {
  try {
    if (!ChallengeRoom) {
      return res.status(500).json({ error: 'ChallengeRoom model not available' });
    }
    const { problemId } = req.body;
    const room = await ChallengeRoom.create({
      creator: req.user.id,
      participants: [req.user.id],
      status: 'waiting',
      problem: problemId || null,
      roomCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Join a challenge room
router.post('/join/:code', protect, async (req, res) => {
  try {
    if (!ChallengeRoom) {
      return res.status(500).json({ error: 'ChallengeRoom model not available' });
    }
    const room = await ChallengeRoom.findOne({ roomCode: req.params.code, status: 'waiting' });
    if (!room) {
      return res.status(404).json({ error: 'Room not found or already started' });
    }
    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room details
router.get('/:id', protect, async (req, res) => {
  try {
    if (!ChallengeRoom) {
      return res.status(500).json({ error: 'ChallengeRoom model not available' });
    }
    const room = await ChallengeRoom.findById(req.params.id).populate('participants', 'name username');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room details' });
  }
});

module.exports = router;
