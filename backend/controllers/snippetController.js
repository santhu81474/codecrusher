const Snippet = require('../models/Snippet');
const User = require('../models/User');

const getSnippets = async (req, res, next) => {
  try {
    const snippets = await Snippet.find({}).populate('authorId', 'name');
    res.json(snippets);
  } catch (error) {
    next(error);
  }
};

const createSnippet = async (req, res, next) => {
  try {
    const { title, description, code, language, tags } = req.body;
    const snippet = await Snippet.create({
      title,
      description,
      code,
      language,
      tags,
      authorId: req.user.id
    });
    res.status(201).json(snippet);
  } catch (error) {
    next(error);
  }
};

const starSnippet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findById(id);
    if (!snippet) return res.status(404).json({ message: 'Snippet not found' });

    if (snippet.starredBy.includes(req.user.id)) {
      // Unstar
      snippet.starredBy = snippet.starredBy.filter(uid => uid.toString() !== req.user.id);
      snippet.stars -= 1;
    } else {
      // Star
      snippet.starredBy.push(req.user.id);
      snippet.stars += 1;
      
      // Boost author profile rating
      await User.findByIdAndUpdate(snippet.authorId, { $inc: { points: 10 } });
    }

    await snippet.save();
    res.json(snippet);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSnippets, createSnippet, starSnippet };
