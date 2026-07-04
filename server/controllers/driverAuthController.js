const Driver = require('../models/Driver.model');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Driver Login
// @route   POST /api/driver/auth/login
// @access  Public
const loginDriver = asyncWrapper(async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return error(res, 'Please provide both mobile number and password.', 400);
  }

  // Find driver by mobile
  const driver = await Driver.findOne({ mobile });
  if (!driver) {
    return error(res, 'Invalid credentials.', 401);
  }

  // Verify password
  const isMatch = await driver.comparePassword(password);
  if (!isMatch) {
    return error(res, 'Invalid credentials.', 401);
  }

  // Check approval status case-insensitively
  const status = (driver.approvalStatus || '').toLowerCase();
  if (status !== 'approved') {
    if (status === 'rejected') {
      return error(res, 'Your application was rejected.', 403);
    }
    return error(res, 'Your account is under review.', 403);
  }

  // Generate JWT token (expires in 7 days)
  const token = jwt.sign(
    { id: driver._id, role: 'driver' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return success(res, {
    token,
    driver: {
      id: driver._id,
      name: driver.name,
      mobile: driver.mobile,
      approvalStatus: driver.approvalStatus
    }
  }, 'Logged in successfully.', 200);
});

module.exports = {
  loginDriver
};
