const User = require('../models/User');
const { agenticMatchmaker } = require('../utils/gemini');

exports.runMatchmaker = async (req, res) => {
  try {
    const { requirements } = req.body;

    if (!requirements) {
      return res.status(400).json({ msg: 'Project requirements are mandatory for the agent to analyze.' });
    }

    // Extract keywords from requirements to pre-filter users
    const keywords = requirements.toLowerCase().split(/[\s,]+/);

    // Agentic Step 1: Data Gathering (Search)
    // Pre-filter so we don't send the entire DB to the AI API, which takes a long time
    let allUsers = await User.find({})
      .select('name skills rating projectsCompleted challengesSolved githubUrl')
      .lean();

    // If there are many users, filter by keyword relevance to limit the payload size
    if (allUsers.length > 20) {
      allUsers = allUsers.filter(u => {
        const userSkillsStr = (u.skills || []).join(' ').toLowerCase();
        return keywords.some(k => userSkillsStr.includes(k));
      }).slice(0, 15);
      
      // Fallback if filtering removed too many
      if (allUsers.length < 3) {
         allUsers = await User.find({}).select('name skills rating projectsCompleted challengesSolved githubUrl').limit(15).lean();
      }
    }

    if (allUsers.length < 3) {
      return res.status(400).json({ msg: 'Not enough users in the talent pool to run team assembly.' });
    }

    // Format data for prompt - minimal fields for latency
    const minimalUsers = allUsers.map(u => ({
      _id: u._id,
      name: u.name,
      skills: u.skills,
      rating: u.rating
    }));
    
    const talentPoolStr = JSON.stringify(minimalUsers);

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
