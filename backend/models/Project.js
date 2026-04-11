const mongoose = require('mongoose');

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
  timestamp: { type: Date, default: Date.now },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
