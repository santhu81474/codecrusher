const User = require('../models/User');
const { agenticMatchmaker } = require('../utils/gemini');

exports.runMatchmaker = async (req, res) => {
  try {
    const { requirements } = req.body;

    if (!requirements) {
      return res.status(400).json({ msg: 'Project requirements are mandatory for the agent to analyze.' });
    }

    // Agentic Step 1: Data Gathering (Search)
    // Fetch all users (excluding passwords, emails for privacy to AI)
    // In a massive app, you'd filter via vector DB. Here we send the pool.
    const allUsers = await User.find({}).select('name skills rating projectsCompleted challengesSolved githubUrl');

    if (allUsers.length < 3) {
      return res.status(400).json({ msg: 'Not enough users in the talent pool to run team assembly.' });
    }

    // Format data for prompt
    const talentPoolStr = JSON.stringify(allUsers, null, 2);

    // Agentic Step 2: Reasoning & Extraction
    // Call Gemini utility wrapping ReAct logic
    const agentResponse = await agenticMatchmaker(requirements, talentPoolStr);

    // AgentResponse is anticipated to be JSON with logs and matches
    res.json(agentResponse);

  } catch (err) {
    console.error('Matchmaker Agent failed:', err.message);
    res.status(500).json({ msg: 'AI Agent failed to execute workflow.', error: err.message });
  }
};
