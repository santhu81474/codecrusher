import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  skills: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  karma: { type: Number, default: 0 },
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
