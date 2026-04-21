const authMiddleware = require('./auth');

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = adminMiddleware;
