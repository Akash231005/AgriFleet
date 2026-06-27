const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

// Helmet security headers (configured for REST flexibility)
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: '*', // Allows development and staging cross-origin requests
  credentials: true
}));

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP address. Please try again later.'
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Mounts
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/bookings', require('./routes/booking.routes'));
app.use('/api/v1/drivers', require('./routes/driver.routes'));
app.use('/api/v1/tractors', require('./routes/fleet.routes'));
app.use('/api/v1/analytics', require('./routes/analytics.routes'));

// Standalone Driver Module Routes
app.use('/api/driver/auth', require('./routes/driverAuth'));
app.use('/api/driver/dashboard', require('./routes/driverDashboard'));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy.', timestamp: new Date() });
});

// Global Error Middleware
app.use(errorHandler);

module.exports = app;
