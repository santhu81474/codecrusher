const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, applyToProject, getUserApplications, deleteProject, addTask, updateTask, deleteTask } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.get('/my-applications', protect, getUserApplications);
router.get('/:id', protect, getProjectById);
router.post('/:projectId/apply', protect, applyToProject);
router.delete('/:id', protect, deleteProject);

// Sprint Board task routes
router.post('/:id/tasks', protect, addTask);
router.put('/:id/tasks/:taskId', protect, updateTask);
router.delete('/:id/tasks/:taskId', protect, deleteTask);

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
