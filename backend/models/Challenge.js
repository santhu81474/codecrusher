const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problemStatement: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  points: { type: Number, default: 100 },
  testCases: [{
    input: { type: String, required: true },
    output: { type: String, required: true }
  }],
  category: { type: String, enum: ['DSA', 'Frontend', 'Backend'], default: 'DSA' },
  activeDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
