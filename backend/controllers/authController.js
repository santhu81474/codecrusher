const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_signature_key', { expiresIn: '30d' });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, skills, githubUrl, linkedinUrl } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skills: skills || [],
      githubUrl: githubUrl || '',
      linkedinUrl: linkedinUrl || ''
    });

    if (user) {
      res.status(201).json({
        _id: user.id, 
        name: user.name, 
        email: user.email, 
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id, 
        name: user.name, 
        email: user.email, 
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
