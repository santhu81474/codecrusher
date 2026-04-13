import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, enum: ['Accepted', 'Wrong Answer', 'Memory Limit Exceeded', 'Time Limit Exceeded'], default: 'Accepted' },
  executionTime: { type: Number },
  memoryUsage: { type: Number },
  pointsEarned: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
