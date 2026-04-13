const express = require('express');
const router = express.Router();
const { getProfile, getUserByUsername, updateProfile, searchUsers, connectUser, disconnectUser, getNetwork } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.get('/profile/:username', protect, getUserByUsername);
router.put('/profile', protect, updateProfile);
router.get('/search', protect, searchUsers);
router.get('/network', protect, getNetwork);
router.post('/connect/:id', protect, connectUser);
router.delete('/disconnect/:id', protect, disconnectUser);

module.exports = router;
