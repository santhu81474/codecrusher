import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // No default for username — sparse unique index only skips null/undefined, NOT empty strings.
  // Allowing '' as default caused 409 duplicate key errors on every connect/save for new users.
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'] },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  skills: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  karma: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  isDemo: { type: Boolean, default: false },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  challengesSolved: { type: Number, default: 0 },
  arenaXP: { type: Number, default: 0 },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

userSchema.index({ username: 'text', name: 'text' });
userSchema.index({ skills: 1 });

export default mongoose.model('User', userSchema);
