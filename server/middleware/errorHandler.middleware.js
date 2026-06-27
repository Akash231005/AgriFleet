const { error } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  // Always log the details internally
  console.error('Error Intercepted:', err.stack || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle specific database/Mongoose error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message;
    });
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = 'Validation Error';
    const fieldFormatted = field === 'email' ? 'Email' : field === 'phone' || field === 'mobile' ? 'Mobile number' : field === 'licenseNumber' ? 'License number' : field;
    errors = { [field]: `${fieldFormatted} already exists` };
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field ${err.path}: ${err.value}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please login again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please login again.';
  }

  return error(res, message, statusCode, errors);
};

module.exports = { errorHandler };
