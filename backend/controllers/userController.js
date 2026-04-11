const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { githubUrl, linkedinUrl } = req.body;
    const updates = {};

    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
