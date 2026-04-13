const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// AI Matchmaker
router.post('/matchmaker', protect, aiController.runMatchmaker);

// AI Code Explainer
router.post('/explain', protect, aiController.explainCode);

// AI Sprint Planner
router.post('/sprint-plan', protect, aiController.generateSprintPlan);

module.exports = router;
