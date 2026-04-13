const User = require('../models/User');
const KarmaTransaction = require('../models/KarmaTransaction');

/**
 * Add karma to a user and log the transaction
 * @param {string} userId - User's MongoDB ID
 * @param {number} amount - Karma amount (positive or negative)
 * @param {string} reason - Human-readable reason
 * @param {string} relatedId - Optional related entity ID
 */
const addKarma = async (userId, amount, reason, relatedId = null) => {
  try {
    // Update user karma
    await User.findByIdAndUpdate(userId, { $inc: { karma: amount } });

    // Log the transaction
    await KarmaTransaction.create({
      userId,
      amount,
      reason,
      relatedId: relatedId || undefined
    });

    return true;
  } catch (error) {
    console.error('Karma service error:', error.message);
    return false;
  }
};

/**
 * Get karma history for a user
 */
const getKarmaHistory = async (userId, limit = 20) => {
  try {
    return await KarmaTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    console.error('Karma history error:', error.message);
    return [];
  }
};

// Karma amounts for different actions
const KARMA_ACTIONS = {
  SOLUTION_ACCEPTED: { amount: 10, reason: 'Accepted solution' },
  CODE_REVIEW: { amount: 5, reason: 'Code review contribution' },
  SNIPPET_HELPFUL: { amount: 2, reason: 'Snippet marked helpful' },
  CHALLENGE_WON: { amount: 25, reason: 'Challenge won' },
  PROJECT_APP_ACCEPTED: { amount: 15, reason: 'Project application accepted' },
  SOLUTION_REJECTED: { amount: -2, reason: 'Solution rejected' },
  SNIPPET_FLAGGED: { amount: -5, reason: 'Snippet flagged' },
};

module.exports = { addKarma, getKarmaHistory, KARMA_ACTIONS };
