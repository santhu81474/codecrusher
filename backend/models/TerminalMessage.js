const mongoose = require('mongoose');

const TerminalMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 250 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TerminalMessage', TerminalMessageSchema);
