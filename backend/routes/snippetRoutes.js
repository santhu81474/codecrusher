import express from 'express';
import { getSnippets, getUserSnippets, createSnippet, starSnippet, updateSnippet, deleteSnippet } from '../controllers/snippetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', protect, getSnippets);
router.get('/user/:userId', protect, getUserSnippets);
router.post('/', protect, createSnippet);
router.post('/:id/star', protect, starSnippet);
router.put('/:id', protect, updateSnippet);
router.delete('/:id', protect, deleteSnippet);

export default router;
