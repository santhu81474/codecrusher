import User from '../models/User.js';
import { mergeSortUsers } from '../utils/mathUtils.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ isDemo: { $ne: true }, email: { $not: /demo/i } }).select('-password');
    const sortedUsers = mergeSortUsers(users);
    res.json(sortedUsers);
  } catch (error) { next(error); }
};
