import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  questions: [{
    questionText: { type: String, required: true },
    options: { type: [String], required: true }
  }],
  correctAnswers: { type: [String], required: true }
}, { timestamps: true });

export default mongoose.model('Test', testSchema);
