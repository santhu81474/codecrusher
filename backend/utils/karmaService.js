import User from '../models/User.js';
import KarmaTransaction from '../models/KarmaTransaction.js';

export const addKarma = async (userId, amount, reason, relatedId = null) => {
  try {
    await User.findByIdAndUpdate(userId, { $inc: { karma: amount } });
    await KarmaTransaction.create({ userId, amount, reason, relatedId: relatedId || undefined });
    return true;
  } catch (error) {
    console.error('Karma service error:', error.message);
    return false;
  }
};

export const getKarmaHistory = async (userId, limit = 20) => {
  try {
    return await KarmaTransaction.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  } catch (error) {
    console.error('Karma history error:', error.message);
    return [];
  }
};

export const KARMA_ACTIONS = {
  SOLUTION_ACCEPTED: { amount: 10, reason: 'Accepted solution' },
  CODE_REVIEW: { amount: 5, reason: 'Code review contribution' },
  SNIPPET_HELPFUL: { amount: 2, reason: 'Snippet marked helpful' },
  CHALLENGE_WON: { amount: 25, reason: 'Challenge won' },
  PROJECT_APP_ACCEPTED: { amount: 15, reason: 'Project application accepted' },
  SOLUTION_REJECTED: { amount: -2, reason: 'Solution rejected' },
  SNIPPET_FLAGGED: { amount: -5, reason: 'Snippet flagged' },
};
