const User = require('../models/User');
const { mergeSortUsers } = require('../utils/mathUtils');

const getLeaderboard = async (req, res, next) => {
  try {
    // Filter: Only Real Users allowed (Bypass demo/placeholder accounts)
    const users = await User.find({ 
      isDemo: { $ne: true },
      email: { $not: /demo/i } 
    }).select('-password');
    
    // Discrete Mathematics: Ranking via custom O(n log n) stable sorting structure
    const sortedUsers = mergeSortUsers(users);
    
    res.json(sortedUsers);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
