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

// Text index for searching snippets by title and description
snippetSchema.index({ title: 'text', description: 'text' });
snippetSchema.index({ language: 1, stars: -1 });
snippetSchema.index({ authorId: 1, createdAt: -1 });
snippetSchema.index({ tags: 1 });

export default mongoose.model('Snippet', snippetSchema);
