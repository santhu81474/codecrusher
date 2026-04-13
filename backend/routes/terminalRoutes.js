import express from 'express';
import { getTerminalHistory, postTerminalMessage } from '../controllers/terminalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/history', protect, getTerminalHistory);
router.post('/message', protect, postTerminalMessage);

export default router;
