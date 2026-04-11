const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  questions: [{
    questionText: { type: String, required: true },
    options: { type: [String], required: true }
  }],
  correctAnswers: { type: [String], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
