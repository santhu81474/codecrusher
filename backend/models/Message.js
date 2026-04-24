import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  command: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for fetching project messages sorted chronologically
messageSchema.index({ projectId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });

export default mongoose.model('Message', messageSchema);
