const express = require('express');
const router = express.Router();
const {
  getDrivers,
  createDriver,
  getMyJobs,
  startJob,
  completeJob,
  getDriverStats,
  getDriverProfile,
  updateDriverProfile,
  reuploadDriverDocuments,
  getDriverNotifications,
  readDriverNotification,
  uploadDocumentBase64,
  getDriverApplications,
  getDriverApplicationDetails,
  approveDriverApplication,
  rejectDriverApplication,
  requestAdditionalDocuments,
  suspendDriver
} = require('../controllers/driver.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');

// Public-ish admin/manager driver views (already existing)
router.get('/', protect, restrictTo('admin', 'fleet_manager'), getDrivers);
router.post('/', protect, restrictTo('admin'), createDriver);

// Driver Portal specific routes
router.get('/my/jobs', protect, restrictTo('driver'), getMyJobs);
router.get('/my/stats', protect, restrictTo('driver'), getDriverStats);
router.get('/my/profile', protect, restrictTo('driver'), getDriverProfile);
router.patch('/my/profile', protect, restrictTo('driver'), updateDriverProfile);
router.patch('/my/reupload-documents', protect, restrictTo('driver'), reuploadDriverDocuments);
router.get('/my/notifications', protect, restrictTo('driver'), getDriverNotifications);
router.patch('/my/notifications/:id/read', protect, restrictTo('driver'), readDriverNotification);
router.post('/upload-document', protect, restrictTo('driver'), uploadDocumentBase64);

router.patch('/jobs/:id/start', protect, restrictTo('driver'), startJob);
router.patch('/jobs/:id/complete', protect, restrictTo('driver'), completeJob);

// Admin-only driver application management
router.get('/admin/applications', protect, restrictTo('admin'), getDriverApplications);
router.get('/admin/applications/:id', protect, restrictTo('admin'), getDriverApplicationDetails);
router.patch('/admin/applications/:id/approve', protect, restrictTo('admin'), approveDriverApplication);
router.patch('/admin/applications/:id/reject', protect, restrictTo('admin'), rejectDriverApplication);
router.patch('/admin/applications/:id/request-docs', protect, restrictTo('admin'), requestAdditionalDocuments);
router.patch('/admin/applications/:id/suspend', protect, restrictTo('admin'), suspendDriver);

module.exports = router;

