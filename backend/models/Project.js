import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['backlog', 'todo', 'in_progress', 'review', 'done'], default: 'backlog' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleType: { type: String, default: '' },
  seniority: { type: String, default: '' },
  workMode: { type: String, default: '' },
  duration: { type: String, default: '' },
  openings: { type: Number, default: 1 },
  compensation: { type: String, default: '' },
  applicationDeadline: { type: Date },
  status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
  githubUrl: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [taskSchema]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
