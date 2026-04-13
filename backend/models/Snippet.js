import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  code: { type: String, required: true },
  language: { type: String, required: true },
  tags: { type: [String], default: [] },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, default: 0 },
  starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Snippet', snippetSchema);
