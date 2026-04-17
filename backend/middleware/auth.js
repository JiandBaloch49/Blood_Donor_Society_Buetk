const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token (expected format: "Bearer <token>")
    const decoded = jwt.verify(
      token.startsWith('Bearer ') ? token.slice(7) : token,
      process.env.JWT_SECRET || 'fallback_secret'
    );
    req.admin = decoded.admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin || req.admin.role !== requiredRole) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth: authMiddleware, checkRole };
