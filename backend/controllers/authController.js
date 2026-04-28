import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const generateUsername = async (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  let username = `${base}${suffix}`;
  let exists = await User.findOne({ username });
  let attempts = 0;
  while (exists && attempts < 10) {
    username = `${base}${Math.floor(Math.random() * 90000 + 10000)}`;
    exists = await User.findOne({ username });
    attempts++;
  }
  return username;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, skills, githubUrl, linkedinUrl, username: requestedUsername } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    let username = requestedUsername && requestedUsername.trim() !== '' ? requestedUsername.trim() : null;
    if (!username) {
      username = await generateUsername(name);
    } else {
      const usernameTaken = await User.findOne({ username });
      if (usernameTaken) {
        username = await generateUsername(name);
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Only set username if it resolved to a non-empty string; otherwise leave undefined
    // so the sparse unique index is not violated.
    const userPayload = {
      name, email, password: hashedPassword,
      skills: skills || [], githubUrl: githubUrl || '', linkedinUrl: linkedinUrl || ''
    };
    if (username && username.trim() !== '') userPayload.username = username;
    const user = await User.create(userPayload);
    if (user) {
      res.status(201).json({
        _id: user.id, name: user.name, username: user.username, email: user.email,
        skills: user.skills, githubUrl: user.githubUrl, linkedinUrl: user.linkedinUrl,
        karma: user.karma, token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id, name: user.name, username: user.username, email: user.email,
        skills: user.skills, githubUrl: user.githubUrl, linkedinUrl: user.linkedinUrl,
        karma: user.karma, connections: user.connections, token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    next(error);
  }
};
