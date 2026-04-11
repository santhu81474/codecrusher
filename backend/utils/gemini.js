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

/**
 * ReAct AI Matchmaker
 */
const agenticMatchmaker = async (projectContext, usersData) => {
  const prompt = `You are an AI Team Matchmaker Agent.
Your task is to analyze a pool of developers and select the top 3 best fits for a given project using a ReAct (Reasoning and Acting) framework.

**Project Requirements:**
${projectContext}

**Available Talent Pool (JSON):**
${usersData}

**Instructions:**
1. Read the Project Requirements carefully.
2. Analyze the Talent Pool. Look at their skills, rating, and platform activity (challenges/projects solved).
3. Select exactly 3 developers who, together, form a balanced team capable of completing the project.
4. Output your entire reasoning process. You MUST format your response strictly as JSON with this schema:
{
  "logs": [
    "Thought: I need to find developers with...",
    "Action: Scanning pool for React experts...",
    "Observation: User X has React and a high rating but no backend experience.",
    "Thought: I should balance User X with a backend dev...",
    "Final Decision: Selecting Users X, Y, Z."
  ],
  "matches": [
    {
      "userId": "MongoDB _id string",
      "name": "User Name",
      "reasoning": "Brief explanation of why this specific user was chosen."
    }
  ]
}

Return ONLY the raw JSON string without any markdown formatting like \`\`\`json.`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    
    // Attempt to parse out any accidental markdown
    let rawText = res.text.trim();
    if (rawText.startsWith('\`\`\`json')) {
      rawText = rawText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (rawText.startsWith('\`\`\`')) {
      rawText = rawText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }
    
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Matchmaker Agent Error:", err);
    throw err;
  }
};

/**
 * Adaptive DAAO Challenge Generator
 */
const generateAdaptiveChallenge = async (userProfileStr, historyStr) => {
  const prompt = `You are the Dynamic Adaptive Arena Optimizer (DAAO).
Your objective is to generate an algorithmic coding challenge specifically designed to improve a user's skills based on their profile and past performance.

**User Profile:**
${userProfileStr}

**Recent Submission History (Look for failure patterns):**
${historyStr}

**Instructions:**
1. Analyze the user's history. Identify what concepts they failed at (e.g., memory leaks, logic mismatch in graphs/trees, arrays).
2. Generate a new challenge tailored to train that specific weakness.
3. If they are succeeding easily, ramp up the difficulty exponentially. If failing repeatedly, step down the difficulty slightly to re-teach core concepts.
4. Scale "points" dynamically. Harder problems = more points (100 - 500).
5. Output MUST be strictly valid JSON matching this schema exactly:
{
  "title": "String (cyberpunk themed)",
  "problemStatement": "String (Markdown format allowed)",
  "difficulty": "Easy" | "Medium" | "Hard",
  "points": number,
  "category": "DSA" | "Frontend" | "Backend",
  "testCases": [{"input": "string", "output": "string"}]
}

Return ONLY raw JSON without markdown \`\`\` wrappers.`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    
    let rawText = res.text.trim();
    if (rawText.startsWith('\`\`\`json')) {
      rawText = rawText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (rawText.startsWith('\`\`\`')) {
      rawText = rawText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }
    
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Adaptive Generation Error:", err);
    return null;
  }
};

/**
 * Analyze Live Complexity
 */
const analyzeComplexity = async (code) => {
  const prompt = `Analyze the following code and return ONLY a JSON response indicating the time and space complexity in Big O notation.
Code:
${code}

Return strictly this JSON schema:
{
  "time": "O(N)",
  "space": "O(1)"
}`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    
    let rawText = res.text.trim();
    if (rawText.startsWith('\`\`\`json')) {
      rawText = rawText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (rawText.startsWith('\`\`\`')) {
      rawText = rawText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }
    
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Complexity AI Error:", err);
    return { time: "O(?)", space: "O(?)" };
  }
};

module.exports = { generateChallenge, validateSubmission, chatWithGemini, agenticMatchmaker, generateAdaptiveChallenge, analyzeComplexity };