const express = require('express');
const router = express.Router();
const {
  getEstimate,
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  approveBooking,
  assignResources,
  autoAssign,
  cancelBooking,
  getDriverRequests,
  selectDriver
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/rbac.middleware');

router.get('/estimate', protect, getEstimate);
router.get('/my', protect, restrictTo('farmer'), getMyBookings);

router.post('/', protect, restrictTo('farmer', 'admin'), createBooking);
router.get('/', protect, restrictTo('admin', 'fleet_manager'), getBookings);

router.get('/:id', protect, getBookingById);
router.patch('/:id/approve', protect, restrictTo('admin'), approveBooking);
router.patch('/:id/assign', protect, restrictTo('admin', 'fleet_manager'), assignResources);
router.patch('/:id/auto-assign', protect, restrictTo('admin', 'fleet_manager'), autoAssign);
router.patch('/:id/cancel', protect, cancelBooking);



// Driver Request Routes
router.get('/:id/driver-requests', protect, restrictTo('farmer'), getDriverRequests);
router.post('/:id/select-driver', protect, restrictTo('farmer'), selectDriver);

module.exports = router;
