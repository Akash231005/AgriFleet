const { error } = require('../utils/apiResponse');

/**
 * Restrict endpoints to specific roles.
 * @param  {...string} roles - Whitelisted user roles ('admin', 'farmer', 'driver', 'fleet_manager')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(
        res,
        `Forbidden. Access restricted. Required role: one of [${roles.join(', ')}]. Found: ${req.user ? req.user.role : 'none'}`,
        403
      );
    }
    next();
  };
};

module.exports = { restrictTo };
