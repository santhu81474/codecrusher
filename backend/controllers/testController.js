// const Test = require('../models/Test');

const submitTest = async (req, res, next) => {
  try {
    const { testId, userAnswers } = req.body;

    // Expected Answers mapping logic (ADA concept: Mathematical Score Evaluation)
    // We mock the DB test fetching for this architectural layout.
    // Real implementation: const test = await Test.findById(testId);

    const correctAnswers = ["A", "C", "D", "B", "A"]; // Mock reference baseline
    let correctCount = 0;

    for (let i = 0; i < correctAnswers.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) correctCount++;
    }

    const score = (correctCount / correctAnswers.length) * 100;

    res.json({
      message: 'Test evaluated successfully',
      score,
      correctCount,
      total: correctAnswers.length
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { submitTest };
