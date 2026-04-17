const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ message: 'No session found, please login again' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
