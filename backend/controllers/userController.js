import User from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
};

export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { githubUrl, linkedinUrl, bio, skills, name } = req.body;
    const updates = {};
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = skills;
    if (name !== undefined) updates.name = name;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) { next(error); }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query is required' });
    // Escape special regex characters to prevent ReDoS
    const sanitized = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const users = await User.find({
      $or: [
        { username: { $regex: sanitized, $options: 'i' } },
        { name: { $regex: sanitized, $options: 'i' } }
      ]
    }).select('name username avatar bio skills rating connections followers karma').limit(20);
    res.json(users);
  } catch (error) { next(error); }
};

export const connectUser = async (req, res, next) => {
  try {
    const userToConnectId = req.params.id;
    const currentUserId = req.user.id;

    // Prevent self-connect
    if (userToConnectId === currentUserId) {
      return res.status(400).json({ message: 'You cannot connect with yourself' });
    }

    // Verify both users exist
    const [currentUser, userToConnect] = await Promise.all([
      User.findById(currentUserId).select('connections'),
      User.findById(userToConnectId).select('_id')
    ]);
    if (!currentUser || !userToConnect) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current connection state
    const isConnected = currentUser.connections.some(
      (id) => id.toString() === userToConnectId
    );

    if (isConnected) {
      // DISCONNECT: atomic $pull — never triggers full document save/validation
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $pull: { connections: userToConnectId } }),
        User.findByIdAndUpdate(userToConnectId, { $pull: { followers: currentUserId } })
      ]);
      const updated = await User.findById(currentUserId).select('connections');
      return res.json({
        message: 'Disconnected successfully',
        connected: false,
        connections: updated.connections
      });
    } else {
      // CONNECT: atomic $addToSet — prevents duplicates, never triggers full doc save
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $addToSet: { connections: userToConnectId } }),
        User.findByIdAndUpdate(userToConnectId, { $addToSet: { followers: currentUserId } })
      ]);
      const updated = await User.findById(currentUserId).select('connections');
      return res.json({
        message: 'Connected successfully',
        connected: true,
        connections: updated.connections
      });
    }
  } catch (error) { next(error); }
};

export const disconnectUser = async (req, res, next) => {
  try {
    const userToDisconnectId = req.params.id;
    const currentUserId = req.user.id;

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId).select('_id'),
      User.findById(userToDisconnectId).select('_id')
    ]);
    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Atomic $pull — never triggers full document validation or unique index checks
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, { $pull: { connections: userToDisconnectId } }),
      User.findByIdAndUpdate(userToDisconnectId, { $pull: { followers: currentUserId } })
    ]);
    const updated = await User.findById(currentUserId).select('connections');
    res.json({ message: 'Disconnected successfully', connections: updated.connections });
  } catch (error) { next(error); }
};

export const getNetwork = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', 'name username avatar bio skills rating karma');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.connections || []);
  } catch (error) { next(error); }
};
