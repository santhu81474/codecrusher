const express = require('express');
const router = express.Router();
const { getSnippets, createSnippet, starSnippet, updateSnippet, deleteSnippet } = require('../controllers/snippetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSnippets);
router.post('/', protect, createSnippet);
router.post('/:id/star', protect, starSnippet);
router.put('/:id', protect, updateSnippet);
router.delete('/:id', protect, deleteSnippet);

module.exports = router;
