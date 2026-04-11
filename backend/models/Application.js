const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Under Review', 'Accepted', 'Rejected'], 
    default: 'Under Review' 
  },
  matchScore: { type: Number, default: 0 },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a user can only apply once to a project
applicationSchema.index({ projectId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
