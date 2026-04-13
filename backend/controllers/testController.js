export const submitTest = async (req, res, next) => {
  try {
    const { testId, userAnswers } = req.body;
    const correctAnswers = ["A", "C", "D", "B", "A"];
    let correctCount = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) correctCount++;
    }
    const score = (correctCount / correctAnswers.length) * 100;
    res.json({ message: 'Test evaluated successfully', score, correctCount, total: correctAnswers.length });
  } catch (error) { next(error); }
};
