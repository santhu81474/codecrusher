import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatWithGemini } from '../utils/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CODEBASE_FILES = [
  { label: 'Auth Middleware (JWT)', path: './middleware/authMiddleware.js' },
  { label: 'Auth Controller (Login/Register)', path: './controllers/authController.js' },
  { label: 'User Model (Mongoose)', path: './models/User.js' },
  { label: 'Project Model (Mongoose)', path: './models/Project.js' },
  { label: 'Challenge Model (Mongoose)', path: './models/Challenge.js' },
  { label: 'Submission Model (Mongoose)', path: './models/Submission.js' },
  { label: 'Project Controller', path: './controllers/projectController.js' },
  { label: 'Challenge Controller', path: './controllers/challengeController.js' },
  { label: 'AI Controller (Matchmaker)', path: './controllers/aiController.js' },
  { label: 'Gemini Utility (All AI functions)', path: './utils/gemini.js' },
  { label: 'Server Entry Point', path: './server.js' },
  { label: 'API Routes - Auth', path: './routes/authRoutes.js' },
  { label: 'API Routes - Projects', path: './routes/projectRoutes.js' },
  { label: 'API Routes - Challenges', path: './routes/challengeRoutes.js' },
  { label: 'API Routes - Gemini', path: './routes/geminiRoutes.js' },
  { label: 'API Routes - AI', path: './routes/aiRoutes.js' },
];

const assembleCodebaseContext = () => {
  const sections = [];
  for (const file of CODEBASE_FILES) {
    const absolutePath = path.resolve(__dirname, '..', file.path);
    try {
      if (fs.existsSync(absolutePath)) {
        const content = fs.readFileSync(absolutePath, 'utf-8');
        sections.push(`--- FILE: ${file.label} (${file.path}) ---\n${content}\n--- END FILE ---`);
      }
    } catch { /* skip */ }
  }
  return sections.join('\n\n');
};

export const queryCodebase = async (req, res) => {
  const { question } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }
  try {
    const codebaseContext = assembleCodebaseContext();
    const ragPrompt = `You are a Retrieval-Augmented Generation (RAG) assistant for the CodeCrusher developer platform.
Your task is to answer questions using ONLY the source code provided below.

RULES:
1. Ground every answer in the actual code provided. Quote exact file names, function names, variable names.
2. If the answer is not found in the provided code, say "I could not find information about that in the current codebase."
3. When showing code, wrap it in triple backticks with the language identifier.
4. At the end of your answer, list the source files you referenced under a "Sources:" heading.
5. Be concise, technical, and direct.

--- BEGIN CODEBASE ---
${codebaseContext}
--- END CODEBASE ---

DEVELOPER QUESTION: ${question}

ANSWER (grounded in the code above):`;
    const answer = await chatWithGemini(ragPrompt);
    const mentionedFiles = CODEBASE_FILES.filter(f => answer.includes(f.path) || answer.includes(f.label)).map(f => f.label);
    res.json({ answer, sources: mentionedFiles.length > 0 ? mentionedFiles : ['Full codebase context provided'], filesIndexed: CODEBASE_FILES.length });
  } catch (error) {
    console.error('RAG Query Error:', error?.message || error);
    res.status(500).json({ error: 'RAG pipeline failed.', details: error?.message });
  }
};
