import express from 'express';
import { getDailyChallenge, submitSolution, getAdaptiveChallenge } from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/daily', protect, getDailyChallenge);
router.get('/adaptive', protect, getAdaptiveChallenge);
router.post('/submit', protect, submitSolution);

export default router;
