const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { generateChallenge, validateSubmission } = require('../utils/gemini');

const getDailyChallenge = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let challenge = await Challenge.findOne({ activeDate: { $gte: today } });
    
    if (!challenge) {
      // Use Gemini to generate a fresh challenge
      const aiChallenge = await generateChallenge();
      if (aiChallenge) {
        challenge = await Challenge.create({
          ...aiChallenge,
          activeDate: today
        });
      } else {
        // Fallback to default
        challenge = await Challenge.create({
          title: "The Reverse Array Protocol",
          problemStatement: "Implement a function `reverseArray(arr)` that reverses the given array in-place with O(1) extra space.",
          difficulty: "Easy",
          points: 50,
          testCases: [{ input: "[1,2,3]", output: "[3,2,1]" }],
          activeDate: today
        });
      }
    }
    
    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

const submitSolution = async (req, res, next) => {
  try {
    const { challengeId, code, language } = req.body;
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    // Use Gemini for strict logic validation
    const result = await validateSubmission(challenge, language, code);
    
    const status = result.isCorrect ? 'Accepted' : 'Wrong Answer';
    const pointsEarned = result.isCorrect ? challenge.points : 0;

    const submission = await Submission.create({
      challengeId,
      userId: req.user.id,
      code,
      language,
      status,
      executionTime: result.executionTimeEstimate || 0,
      memoryUsage: result.memoryUsageEstimate || 0,
      pointsEarned
    });

    if (result.isCorrect) {
      // Update user stats
      await User.findByIdAndUpdate(req.user.id, { 
        $inc: { 
          points: pointsEarned,
          arenaXP: pointsEarned,
          challengesSolved: 1
        } 
      });
    }

    res.status(result.isCorrect ? 201 : 200).json({ 
      message: result.isCorrect ? 'Transmission Successful. Algorithm Verified.' : 'CRITICAL_ERROR: Logic Mismatch Detected.',
      feedback: result.feedback,
      submission,
      pointsEarned 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDailyChallenge, submitSolution };
