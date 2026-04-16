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
    if (userToConnectId === currentUserId) return res.status(400).json({ message: 'You cannot connect with yourself' });
    const userToConnect = await User.findById(userToConnectId);
    const currentUser = await User.findById(currentUserId);
    if (!userToConnect || !currentUser) return res.status(404).json({ message: 'User not found' });
    const isConnected = currentUser.connections && currentUser.connections.map(id => id.toString()).includes(userToConnectId);
    if (isConnected) {
      currentUser.connections = currentUser.connections.filter(id => id.toString() !== userToConnectId);
      userToConnect.followers = (userToConnect.followers || []).filter(id => id.toString() !== currentUserId);
    } else {
      if (!currentUser.connections) currentUser.connections = [];
      if (!userToConnect.followers) userToConnect.followers = [];
      currentUser.connections.push(userToConnectId);
      userToConnect.followers.push(currentUserId);
    }
    await currentUser.save();
    await userToConnect.save();
    res.json({ message: isConnected ? 'Disconnected successfully' : 'Connected successfully', connected: !isConnected, connections: currentUser.connections });
  } catch (error) { next(error); }
};

export const disconnectUser = async (req, res, next) => {
  try {
    const userToDisconnectId = req.params.id;
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userToDisconnectId);
    if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found' });
    currentUser.connections = (currentUser.connections || []).filter(id => id.toString() !== userToDisconnectId);
    targetUser.followers = (targetUser.followers || []).filter(id => id.toString() !== currentUserId);
    await currentUser.save();
    await targetUser.save();
    res.json({ message: 'Disconnected successfully', connections: currentUser.connections });
  } catch (error) { next(error); }
};

export const getNetwork = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', 'name username avatar bio skills rating karma');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.connections || []);
  } catch (error) { next(error); }
};
