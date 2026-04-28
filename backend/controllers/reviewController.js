import Review from '../models/Review.js';
import User from '../models/User.js';

export const addReview = async (req, res, next) => {
  try {
    const { targetUserId, projectId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    // Prevent self-review
    if (reviewerId === targetUserId?.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Validate required fields
    if (!targetUserId || !rating) {
      return res.status(400).json({ message: 'targetUserId and rating are required' });
    }

    // Prevent duplicate reviews for the same reviewer/target/project combination
    const existingReview = await Review.findOne({ reviewerId, targetUserId, projectId: projectId || null });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already submitted a review for this user on this project' });
    }

    const review = await Review.create({ reviewerId, targetUserId, projectId, rating, comment });

    // Recalculate average rating from all reviews for this target
    const allReviews = await Review.find({ targetUserId });
    const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(targetUserId, {
      rating: parseFloat(avgRating.toFixed(2)),
      $inc: { projectsCompleted: 1 }
    });

    res.status(201).json({ message: 'Review added successfully', review, newAverage: avgRating });
  } catch (error) { next(error); }
};
