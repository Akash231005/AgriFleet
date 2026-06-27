const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { error } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  // Retrieve token from Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Access denied. Authentication token missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agrifleet_jwt_secret_dev');
    
    // Find the associated user and exclude password
    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 'The user belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      return error(res, 'This user account is suspended or deactivated.', 403);
    }

    // Attach user information to request context
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT Verification error:', err.message);
    return error(res, 'Access denied. Invalid or expired authentication token.', 401);
  }
};

module.exports = { protect };
