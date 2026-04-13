import express from 'express';
import { submitTest } from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/submit', protect, submitTest);

export default router;
