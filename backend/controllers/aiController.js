import User from '../models/User.js';
import { agenticMatchmaker } from '../utils/gemini.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";

export const runMatchmaker = async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements) {
      return res.status(400).json({ msg: 'Project requirements are mandatory for the agent to analyze.' });
    }
    const keywords = requirements.toLowerCase().split(/[\s,;.]+/).filter(k => k.length > 2);
    let filteredUsers = await User.find({ skills: { $in: keywords.map(k => new RegExp(k, 'i')) } })
      .select('name skills rating projectsCompleted challengesSolved githubUrl karma').limit(20).lean();
    if (filteredUsers.length < 3) {
      filteredUsers = await User.find({}).select('name skills rating projectsCompleted challengesSolved githubUrl karma').limit(15).lean();
    }
    if (filteredUsers.length < 3) {
      return res.status(400).json({ msg: 'Not enough users in the talent pool to run team assembly.' });
    }
    const minimalUsers = filteredUsers.map(u => ({ _id: u._id, name: u.name, skills: u.skills, rating: u.rating }));
    const talentPoolStr = JSON.stringify(minimalUsers);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 10000));
    try {
      const agentResponse = await Promise.race([agenticMatchmaker(requirements, talentPoolStr), timeoutPromise]);
      res.json(agentResponse);
    } catch (aiErr) {
      if (aiErr.message === 'AI_TIMEOUT') {
        const fallbackMatches = minimalUsers.slice(0, 3).map(u => ({
          userId: u._id, name: u.name,
          reasoning: `Direct skill match (AI ranking unavailable). Skills: ${u.skills.join(', ')}`
        }));
        res.json({ logs: ['AI ranking timed out. Showing direct skill matches.'], matches: fallbackMatches, fallback: true });
      } else { throw aiErr; }
    }
  } catch (err) {
    console.error('Matchmaker Agent failed:', err.message);
    res.status(500).json({ msg: 'AI Agent failed to execute workflow.', error: err.message });
  }
};

export const explainCode = async (req, res) => {
  try {
    const { code, language, level } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });
    const complexityMap = {
      'beginner': 'a beginner. Use simple analogies and avoid jargon.',
      'intermediate': 'an intermediate developer. Use technical terms but explain complex concepts.',
      'expert': 'an expert developer. Be concise, use precise technical terminology. Focus on architecture and trade-offs.'
    };
    const levelDesc = complexityMap[level] || complexityMap['intermediate'];
    const prompt = `Explain this ${language || 'code'} code for ${levelDesc}\n\nFormat your response with:\n1) **What it does** (2 sentences max)\n2) **How it works** (step by step, numbered)\n3) **Why this approach** (trade-offs and alternatives)\n\nCode:\n\`\`\`${language || ''}\n${code}\n\`\`\``;
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt });
    res.json({ explanation: result.text || 'Could not generate explanation.' });
  } catch (err) {
    console.error('AI Explain Error:', err.message);
    res.status(500).json({ error: 'Failed to explain code', details: err.message });
  }
};

export const generateSprintPlan = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Project description is required' });
    const prompt = `Break down this project into development tasks organized by sprint phase.\nReturn ONLY valid JSON matching this schema:\n{\n  "todo": [{"title": "string", "description": "string", "priority": "low|medium|high"}],\n  "in_progress": [],\n  "review": [],\n  "done": []\n}\n\nProject: ${description}\n\nReturn ONLY raw JSON, no markdown wrappers.`;
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt });
    let rawText = result.text.trim();
    if (rawText.startsWith('```json')) { rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim(); }
    else if (rawText.startsWith('```')) { rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim(); }
    const tasks = JSON.parse(rawText);
    res.json(tasks);
  } catch (err) {
    console.error('Sprint Plan Error:', err.message);
    res.status(500).json({ error: 'Failed to generate sprint plan', details: err.message });
  }
};
