const express = require('express');
const router = express.Router();
const { getDailyChallenge, submitSolution } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/daily', protect, getDailyChallenge);
router.post('/submit', protect, submitSolution);

module.exports = router;
