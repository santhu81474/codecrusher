import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import ChallengeRoom from '../models/ChallengeRoom.js';

const router = express.Router();

router.post('/create', protect, async (req, res) => {
  try {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = await ChallengeRoom.create({
      creator: req.user.id,
      roomCode,
      participants: [req.user.id],
      problem: req.body.problemId || null,
    });
    res.json({ roomCode: room.roomCode, roomId: room._id, message: 'Challenge room created' });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create challenge room' });
  }
});

router.post('/join/:code', protect, async (req, res) => {
  try {
    const room = await ChallengeRoom.findOne({ roomCode: req.params.code.toUpperCase() });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status === 'completed') return res.status(400).json({ error: 'Room already completed' });
    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }
    res.json({ roomCode: room.roomCode, roomId: room._id, message: 'Joined room' });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Failed to join challenge room' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const room = await ChallengeRoom.findById(req.params.id)
      .populate('creator', 'name username')
      .populate('participants', 'name username');
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get challenge room' });
  }
});

export default router;
