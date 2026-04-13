const mongoose = require('mongoose');

const challengeRoomSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  problem: { type: mongoose.Schema.Types.Mixed }, // Challenge problem data
  roomCode: { type: String, required: true, unique: true },
  startTime: { type: Date },
  endTime: { type: Date },
  results: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    progress: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('ChallengeRoom', challengeRoomSchema);
