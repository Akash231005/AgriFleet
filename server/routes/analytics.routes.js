const express = require('express');
const router = express.Router();
const {
  getOperationalSummary,
  getRevenueStats,
  getFleetUtilization,
  getDriverPerformance
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');

router.get('/summary', protect, restrictTo('admin', 'fleet_manager'), getOperationalSummary);
router.get('/revenue', protect, restrictTo('admin'), getRevenueStats);
router.get('/fleet', protect, restrictTo('admin', 'fleet_manager'), getFleetUtilization);
router.get('/drivers', protect, restrictTo('admin'), getDriverPerformance);

module.exports = router;
