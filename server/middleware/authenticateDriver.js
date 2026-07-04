const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver.model');
const { error } = require('../utils/apiResponse');

const authenticateDriver = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Access denied. Driver authentication token missing.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the associated driver by userId first (single auth source), fallback to _id
    let driver = await Driver.findOne({ userId: decoded.id });
    if (!driver) {
      driver = await Driver.findById(decoded.id);
    }
    if (!driver) {
      return error(res, 'The driver account belonging to this token no longer exists.', 401);
    }

    // Case-insensitive status check
    const status = (driver.approvalStatus || '').toLowerCase();
    if (status !== 'approved') {
      if (status === 'rejected') {
        return error(res, 'Your application was rejected.', 403);
      }
      return error(res, 'Your account is under review.', 403);
    }

    // Attach driver details to the request context
    req.driver = driver;
    next();
  } catch (err) {
    console.error('Driver JWT Verification error:', err);
    return error(res, 'Access denied. Invalid or expired driver token.', 401);
  }
};

module.exports = authenticateDriver;
