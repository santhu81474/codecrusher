import TerminalMessage from '../models/TerminalMessage.js';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";

export const getTerminalHistory = async (req, res, next) => {
  try {
    const messages = await TerminalMessage.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(messages.reverse());
  } catch (error) { next(error); }
};

export const postTerminalMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || content.length > 250) {
      return res.status(400).json({ message: 'Message content is invalid or exceeds 250 characters.' });
    }
    const userMessage = new TerminalMessage({ userId: req.user.id, role: 'user', content });
    await userMessage.save();
    const history = await TerminalMessage.find({ userId: req.user.id }).sort({ createdAt: 1 }).limit(20);
    const conversationContext = history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `You are a helpful AI assistant on CodeCrusher, a developer collaboration platform. Be concise, technical, and helpful. Keep responses under 200 words.\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${content}\n\nRespond helpfully:`;
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = result.text || 'I apologize, I could not generate a response.';
    const assistantMessage = new TerminalMessage({ userId: req.user.id, role: 'assistant', content: text.substring(0, 2000) });
    await assistantMessage.save();
    res.json({ userMessage, assistantMessage });
  } catch (error) {
    console.error('Terminal AI Error:', error.message);
    try {
      const fallbackMsg = new TerminalMessage({ userId: req.user.id, role: 'assistant', content: 'Sorry, I encountered an error processing your request. Please try again.' });
      await fallbackMsg.save();
      res.json({ userMessage: { role: 'user', content: req.body.content, createdAt: new Date() }, assistantMessage: fallbackMsg });
    } catch { next(error); }
  }
};
