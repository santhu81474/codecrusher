import mongoose from 'mongoose';

const karmaTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

karmaTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('KarmaTransaction', karmaTransactionSchema);
