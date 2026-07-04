const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

const requiredEnv = ['NODE_ENV', 'MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE', 'PORT'];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`CRITICAL ERROR: ${env} environment variable is missing.`);
    process.exit(1);
  }
}

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`AgriFleet Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Promise Rejection: ${err.message}`);
  // Gracefully close server before exiting process
  server.close(() => process.exit(1));
});
