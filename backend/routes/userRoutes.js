import express from 'express';
import { getProfile, getUserByUsername, updateProfile, searchUsers, connectUser, disconnectUser, getNetwork } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateRequest.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/profile', protect, getProfile);
router.get('/profile/:username', protect, getUserByUsername);
router.put('/profile', protect, updateProfile);
// validateObjectId prevents malformed IDs from causing 500 CastErrors
router.post('/connect/:id', protect, validateObjectId('id'), connectUser);
router.delete('/disconnect/:id', protect, validateObjectId('id'), disconnectUser);
router.get('/network', protect, getNetwork);

export default router;
