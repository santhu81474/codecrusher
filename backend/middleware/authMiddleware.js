const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_signature_key');
    req.user = decoded; // Contains { id: userId }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

module.exports = { protect };
