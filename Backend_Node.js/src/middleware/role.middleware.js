/**
 * Middleware factory that requires a minimum role.
 * Simple hierarchy: ADMIN > USER
 */
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const roleHierarchy = { USER: 1, ADMIN: 2 };

    if (roleHierarchy[req.user.role] < roleHierarchy[requiredRole]) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = { requireRole };