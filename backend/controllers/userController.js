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

// Search users by profile name
const searchUsers = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Please provide a name to search' });
    }
    const regex = new RegExp(name, 'i'); // Case-insensitive search
    const users = await User.find({ name: regex })
      .select('-password')
      .limit(20);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Connect / Follow a user
const connectUser = async (req, res, next) => {
  try {
    const userToConnectId = req.params.id;
    const currentUserId = req.user.id;

    if (userToConnectId === currentUserId) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    const userToConnect = await User.findById(userToConnectId);
    const currentUser = await User.findById(currentUserId);

    if (!userToConnect || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle connection logic
    const isConnected = currentUser.connections && currentUser.connections.includes(userToConnectId);

    if (isConnected) {
      // Disconnect
      currentUser.connections = currentUser.connections.filter(
        id => id.toString() !== userToConnectId
      );
      userToConnect.followers = userToConnect.followers.filter(
        id => id.toString() !== currentUserId
      );
    } else {
      // Connect
      if (!currentUser.connections) currentUser.connections = [];
      if (!userToConnect.followers) userToConnect.followers = [];
      currentUser.connections.push(userToConnectId);
      userToConnect.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToConnect.save();

    res.json({ message: isConnected ? 'Disconnected successfully' : 'Connected successfully', connections: currentUser.connections });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, searchUsers, connectUser };
