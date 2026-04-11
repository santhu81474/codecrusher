const express = require('express');
const router = express.Router();
const { addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addReview);

module.exports = router;
