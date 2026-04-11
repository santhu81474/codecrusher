const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

/**
 * Generates a new coding challenge
 */
const generateChallenge = async () => {
  const prompt = `Generate a coding challenge for a "Hacker/Cyberpunk" themed platform.
Return ONLY valid JSON with:
title, problemStatement, difficulty, points, category, testCases`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = res.text;
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Generation Error:", err);
    return null;
  }
};

/**
 * Validates submission
 */
const validateSubmission = async (challenge, lang, code) => {
  if (!code || code.trim().length < 5) {
    return { isCorrect: false, feedback: "CODE_TOO_SMALL" };
  }

  const prompt = `
Challenge: ${challenge.title}
${challenge.problemStatement}

Language: ${lang}
Code:
${code}

Return ONLY JSON:
{
  "isCorrect": boolean,
  "feedback": "short",
  "executionTimeEstimate": number,
  "memoryUsageEstimate": number
}`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return JSON.parse(res.text);
  } catch (err) {
    console.error("Gemini Validation Error:", err);
    return { isCorrect: false, feedback: "AI_FAILURE" };
  }
};

/**
 * Chat
 */
const chatWithGemini = async (prompt) => {
  const systemContext = `You are a helpful AI Assistant integrated into TeamForge.
TeamForge is a coding and collaboration platform where developers can team up, tackle challenges, and build projects.
Features on the Navigation Bar include:
- Dashboard: View your stats, recent activity, and rank.
- Explore: Find new projects, teams, and peers to collaborate with.
- Create: Spin up a new project seeking team members.
- Applications: Check the status of projects you've applied to join.
- Leaderboard: See the top-ranking developers by XP.
- Arena: Solve interactive algorithm challenges to gain XP.
- Forge: Save, share, and star code snippets or components you've built.
- Skill Tests: Take exams to prove your proficiency in different languages.
- AI Assistant: This exact chat portal, where you assist the user..

Always respond naturally and professionally as a knowledgeable senior software engineer and mentor. Do not use overly robotic, hacker, or cyberpunk themes. Be concise, technical, and helpful.

User query: ${prompt}`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: systemContext,
    });

    return res.text || "No response";
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    throw err;
  }
};

module.exports = { generateChallenge, validateSubmission, chatWithGemini };