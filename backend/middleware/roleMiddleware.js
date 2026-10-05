/**
 * Middleware to restrict endpoints to users with 'provider' role.
 * Requires authMiddleware to have run beforehand (populating req.user).
 */
const requireProvider = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'provider') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only service providers can access this resource.'
    });
  }

  next();
};

module.exports = {
  requireProvider
};
