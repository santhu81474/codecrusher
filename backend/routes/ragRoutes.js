const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { queryCodebase } = require('../controllers/ragController');

// POST /api/rag/query — RAG-grounded codebase Q&A
router.post('/query', protect, queryCodebase);

module.exports = router;
