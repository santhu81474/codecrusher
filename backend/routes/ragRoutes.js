import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { queryCodebase } from '../controllers/ragController.js';

const router = express.Router();
router.post('/query', protect, queryCodebase);

export default router;
