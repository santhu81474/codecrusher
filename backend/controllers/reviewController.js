import Review from '../models/Review.js';
import User from '../models/User.js';

export const addReview = async (req, res, next) => {
  try {
    const { targetUserId, projectId, rating, comment } = req.body;
    const review = await Review.create({ reviewerId: req.user.id, targetUserId, projectId, rating, comment });
    const allReviews = await Review.find({ targetUserId });
    const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(targetUserId, { rating: parseFloat(avgRating.toFixed(2)), $inc: { projectsCompleted: 1 } });
    res.status(201).json({ message: 'Review added successfully', review, newAverage: avgRating });
  } catch (error) { next(error); }
};
