const express = require('express');
const router = express.Router();
const authenticateDriver = require('../middleware/authenticateDriver');
const {
  toggleStatus,
  getOverview,
  getAvailableJobs, // @deprecated
  requestJob, // @deprecated
  getMyJobsDashboard,
  acceptJobDashboard,
  startJobDashboard,
  completeJobDashboard,
  getJobHistory,
  getPayments
} = require('../controllers/driverDashboardController');

// All dashboard endpoints require valid driver authentication
router.use(authenticateDriver);

router.patch('/toggle-status', toggleStatus);
router.get('/overview', getOverview);
router.get('/available-jobs', getAvailableJobs); // @deprecated
router.post('/request-job', requestJob); // @deprecated
router.get('/my-jobs', getMyJobsDashboard);
router.patch('/jobs/:id/accept', acceptJobDashboard);
router.patch('/jobs/:id/start', startJobDashboard);
router.patch('/jobs/:id/complete', completeJobDashboard);
router.get('/job-history', getJobHistory);
router.get('/payments', getPayments);

module.exports = router;
