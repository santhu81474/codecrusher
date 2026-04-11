const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  isDemo: { type: Boolean, default: false },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  challengesSolved: { type: Number, default: 0 },
  arenaXP: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
