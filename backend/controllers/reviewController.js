const Review = require('../models/Review');
const User = require('../models/User');

const addReview = async (req, res, next) => {
  try {
    const { targetUserId, projectId, rating, comment } = req.body;
    
    const review = await Review.create({
      reviewerId: req.user.id,
      targetUserId,
      projectId, 
      rating,
      comment
    });
    
    // Update user's average rating dynamically
    const allReviews = await Review.find({ targetUserId });
    const avgRating = allReviews.reduce((acc, item) => acc + item.rating, 0) / allReviews.length;
    
    await User.findByIdAndUpdate(targetUserId, { 
        rating: parseFloat(avgRating.toFixed(2)),
        $inc: { projectsCompleted: 1 } // Increment completed counter computationally
    });
    
    res.status(201).json({ message: 'Review added successfully', review, newAverage: avgRating });
  } catch (error) {
    next(error);
  }
};

module.exports = { addReview };
