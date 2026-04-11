const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// Define AI endpoints
router.post('/matchmaker', protect, aiController.runMatchmaker);

module.exports = router;
