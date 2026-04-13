const express = require('express');
const router = express.Router();
const { getTerminalHistory, postTerminalMessage } = require('../controllers/terminalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getTerminalHistory);
router.post('/message', protect, postTerminalMessage);

module.exports = router;
