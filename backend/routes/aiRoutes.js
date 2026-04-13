import express from 'express';
import { runMatchmaker, explainCode, generateSprintPlan } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/matchmaker', protect, runMatchmaker);
router.post('/explain', protect, explainCode);
router.post('/sprint-plan', protect, generateSprintPlan);

export default router;
