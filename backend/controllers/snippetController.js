import Snippet from '../models/Snippet.js';
import User from '../models/User.js';

export const getSnippets = async (req, res, next) => {
  try {
    const snippets = await Snippet.find({}).populate('authorId', 'name username').sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) { next(error); }
};

export const getUserSnippets = async (req, res, next) => {
  try {
    const snippets = await Snippet.find({ authorId: req.params.userId }).populate('authorId', 'name username').sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) { next(error); }
};

export const createSnippet = async (req, res, next) => {
  try {
    const { title, description, code, language, tags } = req.body;
    const snippet = await Snippet.create({ title, description, code, language, tags, authorId: req.user.id });
    const populated = await snippet.populate('authorId', 'name username');
    res.status(201).json(populated);
  } catch (error) { next(error); }
};

export const starSnippet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findById(id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    if (snippet.starredBy.includes(req.user.id)) {
      snippet.starredBy = snippet.starredBy.filter(uid => uid.toString() !== req.user.id);
      snippet.stars = Math.max(0, snippet.stars - 1);
    } else {
      snippet.starredBy.push(req.user.id);
      snippet.stars += 1;
      await User.findByIdAndUpdate(snippet.authorId, { $inc: { karma: 2 } });
    }
    await snippet.save();
    const populated = await snippet.populate('authorId', 'name username');
    res.json(populated);
  } catch (error) { next(error); }
};

export const updateSnippet = async (req, res, next) => {
  try {
    const { title, description, code, language, tags } = req.body;
    let snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    if (snippet.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to edit this snippet' });
    snippet.title = title || snippet.title;
    snippet.description = description !== undefined ? description : snippet.description;
    snippet.code = code || snippet.code;
    snippet.language = language || snippet.language;
    snippet.tags = tags || snippet.tags;
    await snippet.save();
    const populated = await snippet.populate('authorId', 'name username');
    res.json(populated);
  } catch (error) { next(error); }
};

export const deleteSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });
    if (snippet.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete this snippet' });
    await snippet.deleteOne();
    res.json({ message: 'Snippet removed' });
  } catch (error) { next(error); }
};
