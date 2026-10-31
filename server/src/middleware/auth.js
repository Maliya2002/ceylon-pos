const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ceylon-pos-secret-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Unauthorized: Role '${req.user ? req.user.role : 'Guest'}' is not allowed to access this resource`,
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET,
};
