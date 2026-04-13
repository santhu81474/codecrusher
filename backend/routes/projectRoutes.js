const express = require('express');
const router = express.Router();
const { createProject, getProjects, applyToProject, getUserApplications, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const Message = require('../models/Message');

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.get('/my-applications', protect, getUserApplications);
router.post('/:projectId/apply', protect, applyToProject);
router.delete('/:id', protect, deleteProject);

// Get messages for terminal chat
router.get('/:projectId/messages', protect, async (req, res, next) => {
  try {
    const messages = await Message.find({ projectId: req.params.projectId })
      .populate('senderId', 'name')
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
