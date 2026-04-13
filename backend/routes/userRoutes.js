import express from 'express';
import { getProfile, getUserByUsername, updateProfile, searchUsers, connectUser, disconnectUser, getNetwork } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/profile', protect, getProfile);
router.get('/profile/:username', protect, getUserByUsername);
router.put('/profile', protect, updateProfile);
router.post('/connect/:id', protect, connectUser);
router.delete('/disconnect/:id', protect, disconnectUser);
router.get('/network', protect, getNetwork);

export default router;
