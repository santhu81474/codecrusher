const mongoose = require('mongoose');

const karmaTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // optional reference to the related entity
}, { timestamps: true });

karmaTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('KarmaTransaction', karmaTransactionSchema);
