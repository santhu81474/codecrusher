const express = require('express');
const router = express.Router();
const { getSnippets, createSnippet, starSnippet } = require('../controllers/snippetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSnippets);
router.post('/', protect, createSnippet);
router.post('/:id/star', protect, starSnippet);

module.exports = router;
