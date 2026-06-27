const express = require('express');
const router = express.Router();
const {
  getTractors,
  addTractor,
  updateTractor,
  getAttachments,
  addAttachment,
  updateAttachment,
  logFuel,
  getFuelHistory,
  logMaintenance,
  getMaintenanceHistory
} = require('../controllers/fleet.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');

// Tractor endpoints
router.get('/', protect, getTractors);
router.post('/', protect, restrictTo('admin', 'fleet_manager'), addTractor);
router.patch('/:id', protect, restrictTo('admin', 'fleet_manager'), updateTractor);

// Attachment endpoints
router.get('/attachments', protect, getAttachments);
router.post('/attachments', protect, restrictTo('admin', 'fleet_manager'), addAttachment);
router.patch('/attachments/:id', protect, restrictTo('admin', 'fleet_manager'), updateAttachment);

// Fuel Log endpoints
router.get('/fuel', protect, restrictTo('admin', 'fleet_manager'), getFuelHistory);
router.post('/fuel', protect, restrictTo('admin', 'fleet_manager'), logFuel);

// Maintenance Log endpoints
router.get('/maintenance', protect, restrictTo('admin', 'fleet_manager'), getMaintenanceHistory);
router.post('/maintenance', protect, restrictTo('admin', 'fleet_manager'), logMaintenance);

module.exports = router;
