const Booking = require('../models/Booking.model');
const Farmer = require('../models/Farmer.model');
const Tractor = require('../models/Tractor.model');
const Driver = require('../models/Driver.model');
const Attachment = require('../models/Attachment.model');
const Notification = require('../models/Notification.model');
const JobRequest = require('../models/JobRequest.model');

const { calculateEstimate } = require('../services/estimation.service');
const { allocateResources } = require('../services/allocation.service');
const { success, error } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Get dynamic cost estimation before creating a booking
// @route   GET /api/v1/bookings/estimate
// @access  Private
const getEstimate = asyncWrapper(async (req, res) => {
  const { workType, areaAcres } = req.query;

  if (!workType || !areaAcres) {
    return error(res, 'Please provide both workType and areaAcres parameters.', 400);
  }

  const acres = parseFloat(areaAcres);
  if (isNaN(acres) || acres <= 0) {
    return error(res, 'Invalid areaAcres value.', 400);
  }

  const estimate = calculateEstimate(workType, acres);
  return success(res, estimate, 'Cost estimate calculated.', 200);
});

// @desc    Create a new booking request
// @route   POST /api/v1/bookings
// @access  Private (Farmer role)
const createBooking = asyncWrapper(async (req, res) => {
  const { workType, areaAcres, scheduledDate, timeSlot, fieldLocation } = req.body;

  // Retrieve Farmer record associated with user
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) {
    return error(res, 'Farmer profile not found for this user.', 404);
  }

  // Calculate estimations
  const { estimatedHours, estimatedFuel, estimatedCost } = calculateEstimate(workType, parseFloat(areaAcres));

  const booking = await Booking.create({
    farmerId: farmer._id,
    workType,
    areaAcres,
    fieldLocation,
    scheduledDate: new Date(scheduledDate),
    timeSlot,
    estimatedHours,
    estimatedFuel,
    estimatedCost,
    status: 'pending'
  });

  // Create notifications
  await Notification.create({
    userId: req.user._id,
    bookingId: booking._id,
    type: 'booking_confirmed',
    title: 'Booking Request Submitted',
    message: `Your booking request ${booking.bookingRef} for ${workType} is pending review.`
  });

  return success(res, booking, 'Booking requested successfully.', 201);
});

// @desc    Get all bookings (Admin/Fleet view)
// @route   GET /api/v1/bookings
// @access  Private (Admin / Fleet Manager)
const getBookings = asyncWrapper(async (req, res) => {
  const { status, limit = 50, page = 1 } = req.query;
  const filter = {};
  
  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const bookings = await Booking.find(filter)
    .populate({ path: 'farmerId', populate: { path: 'userId', select: 'name email phone' } })
    .populate({ path: 'driverId', populate: { path: 'userId', select: 'name email phone' } })
    .populate('tractorId')
    .populate('attachmentId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  return success(res, bookings, 'Bookings retrieved.', 200, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  });
});

// @desc    Get farmer's own bookings
// @route   GET /api/v1/bookings/my
// @access  Private (Farmer)
const getMyBookings = asyncWrapper(async (req, res) => {
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer) {
    return error(res, 'Farmer profile not found.', 404);
  }

  const bookings = await Booking.find({ farmerId: farmer._id })
    .populate({ path: 'driverId', populate: { path: 'userId', select: 'name phone' } })
    .populate('tractorId')
    .populate('attachmentId')
    .sort({ createdAt: -1 });

  return success(res, bookings, 'Farmer bookings retrieved.', 200);
});

// @desc    Get booking details by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
const getBookingById = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({ path: 'farmerId', populate: { path: 'userId', select: 'name email phone' } })
    .populate({ path: 'driverId', populate: { path: 'userId', select: 'name phone profilePhoto' } })
    .populate('tractorId')
    .populate('attachmentId');

  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  return success(res, booking, 'Booking details fetched.', 200);
});

// @desc    Approve booking request (Transition pending -> confirmed)
// @route   PATCH /api/v1/bookings/:id/approve
// @access  Private (Admin)
const approveBooking = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  if (booking.status !== 'pending') {
    return error(res, `Booking cannot be approved from current status: ${booking.status}.`, 400);
  }

  booking.status = 'confirmed';
  await booking.save();

  // Notify farmer
  const farmer = await Farmer.findById(booking.farmerId);
  if (farmer) {
    await Notification.create({
      userId: farmer.userId,
      bookingId: booking._id,
      type: 'booking_confirmed',
      title: 'Booking Approved',
      message: `Your booking request ${booking.bookingRef} is approved and awaiting resource assignment.`
    });
  }

  return success(res, booking, 'Booking approved successfully.', 200);
});

// @desc    Manually assign driver, tractor, and attachment
// @route   PATCH /api/v1/bookings/:id/assign
// @access  Private (Admin / Fleet Manager)
const assignResources = asyncWrapper(async (req, res) => {
  const { driverId, tractorId, attachmentId } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  if (booking.status === 'pending') {
    return error(res, 'Please approve the booking request before resource allocation.', 400);
  }

  const driver = await Driver.findById(driverId);
  const tractor = await Tractor.findById(tractorId);
  const attachment = await Attachment.findById(attachmentId);

  if (!driver || !tractor || !attachment) {
    return error(res, 'One or more resource records (Driver, Tractor, Attachment) are invalid.', 400);
  }

  // Update booking assignments
  booking.driverId = driverId;
  booking.tractorId = tractorId;
  booking.attachmentId = attachmentId;
  booking.status = 'assigned';
  await booking.save();

  // Set resource statuses to active
  driver.status = 'on_job';
  await driver.save();

  tractor.status = 'on_job';
  tractor.currentDriverId = driver._id;
  await tractor.save();

  attachment.status = 'in_use';
  attachment.currentTractorId = tractor._id;
  await attachment.save();

  // Notifications
  const farmer = await Farmer.findById(booking.farmerId);
  if (farmer) {
    await Notification.create({
      userId: farmer.userId,
      bookingId: booking._id,
      type: 'driver_assigned',
      title: 'Resources Allocated',
      message: `Driver ${driver.phone} and equipment have been scheduled for service ${booking.bookingRef}.`
    });
  }

  await Notification.create({
    userId: driver.userId,
    bookingId: booking._id,
    type: 'driver_assigned',
    title: 'New Job Assigned',
    message: `You have been assigned to service booking ${booking.bookingRef} on ${booking.scheduledDate.toLocaleDateString()}.`
  });

  return success(res, booking, 'Resources assigned successfully.', 200);
});

// @desc    Trigger Smart Auto-Allocation Engine
// @route   PATCH /api/v1/bookings/:id/auto-assign
// @access  Private (Admin / Fleet Manager)
const autoAssign = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  if (booking.status === 'pending') {
    return error(res, 'Please approve the booking request before resource allocation.', 400);
  }

  try {
    const allocated = await allocateResources(booking);
    
    // Assign fields
    booking.driverId = allocated.driver._id;
    booking.tractorId = allocated.tractor._id;
    booking.attachmentId = allocated.attachment._id;
    booking.status = 'assigned';
    await booking.save();

    // Mark statuses
    allocated.driver.status = 'on_job';
    await allocated.driver.save();

    allocated.tractor.status = 'on_job';
    allocated.tractor.currentDriverId = allocated.driver._id;
    await allocated.tractor.save();

    allocated.attachment.status = 'in_use';
    allocated.attachment.currentTractorId = allocated.tractor._id;
    await allocated.attachment.save();

    // Notify farmer
    const farmer = await Farmer.findById(booking.farmerId);
    if (farmer) {
      await Notification.create({
        userId: farmer.userId,
        bookingId: booking._id,
        type: 'driver_assigned',
        title: 'Auto-Allocation Complete',
        message: `Tractor, attachment, and driver assigned automatically for service ${booking.bookingRef}.`
      });
    }

    // Notify driver
    await Notification.create({
      userId: allocated.driver.userId,
      bookingId: booking._id,
      type: 'driver_assigned',
      title: 'Auto-Assigned Task',
      message: `System assigned you task ${booking.bookingRef} for ${booking.workType}.`
    });

    return success(res, booking, 'Auto-allocation succeeded.', 200);
  } catch (err) {
    if (err.message.startsWith('NO_')) {
      return error(res, `Smart allocation failed: ${err.message}. Please allocate manually.`, 409);
    }
    throw err;
  }
});

// @desc    Cancel booking
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Private (Farmer / Admin)
const cancelBooking = asyncWrapper(async (req, res) => {
  const { cancelReason } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return error(res, `Booking cannot be cancelled from status: ${booking.status}`, 400);
  }

  // Release resource locks if currently assigned
  if (booking.driverId) {
    await Driver.findByIdAndUpdate(booking.driverId, { status: 'available' });
  }
  if (booking.tractorId) {
    await Tractor.findByIdAndUpdate(booking.tractorId, { status: 'available', currentDriverId: null });
  }
  if (booking.attachmentId) {
    await Attachment.findByIdAndUpdate(booking.attachmentId, { status: 'available', currentTractorId: null });
  }

  booking.status = 'cancelled';
  booking.cancelReason = cancelReason || 'Cancelled by user';
  booking.cancelledBy = req.user._id;
  await booking.save();

  // Notifications
  const farmer = await Farmer.findById(booking.farmerId);
  if (farmer) {
    await Notification.create({
      userId: farmer.userId,
      bookingId: booking._id,
      type: 'system',
      title: 'Booking Cancelled',
      message: `Service booking ${booking.bookingRef} has been cancelled.`
    });
  }

  return success(res, booking, 'Booking cancelled successfully.', 200);
});



// @desc    Get driver requests for a specific booking
// @route   GET /api/v1/bookings/:id/driver-requests
// @access  Private (Farmer)
const getDriverRequests = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return error(res, 'Booking not found.', 404);
  }

  // Ensure this booking belongs to the farmer requesting
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer || booking.farmerId.toString() !== farmer._id.toString()) {
    return error(res, 'Not authorized to view requests for this booking.', 403);
  }

  const requests = await JobRequest.find({ bookingId: booking._id, status: 'pending' })
    .populate('driverId', 'name mobile profilePhoto rating totalJobsCompleted district village');

  return success(res, requests, 'Driver requests fetched.', 200);
});

// @desc    Select a driver from requests
// @route   POST /api/v1/bookings/:id/select-driver
// @access  Private (Farmer)
const selectDriver = asyncWrapper(async (req, res) => {
  const { driverId } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking || booking.status !== 'pending') {
    return error(res, 'Booking not available for assignment.', 400);
  }

  // Verify farmer ownership
  const farmer = await Farmer.findOne({ userId: req.user._id });
  if (!farmer || booking.farmerId.toString() !== farmer._id.toString()) {
    return error(res, 'Not authorized.', 403);
  }

  const jobRequest = await JobRequest.findOne({ bookingId: booking._id, driverId, status: 'pending' });
  if (!jobRequest) {
    return error(res, 'Job request not found or already processed.', 404);
  }

  // Find Driver
  const driver = await Driver.findById(driverId);
  if (!driver || (driver.approvalStatus && driver.approvalStatus.toUpperCase() !== 'APPROVED') || !driver.isOnline) {
    return error(res, 'Driver is no longer available.', 400);
  }

  // Update JobRequest statuses
  await JobRequest.updateMany(
    { bookingId: booking._id },
    { $set: { status: 'not_selected', respondedAt: new Date() } }
  );

  jobRequest.status = 'selected';
  jobRequest.respondedAt = new Date();
  await jobRequest.save();

  // Update Booking
  booking.driverId = driver._id;
  booking.status = 'assigned';
  await booking.save();

  // Create notifications
  await Notification.create({
    userId: driver.userId || driver._id,
    bookingId: booking._id,
    type: 'driver_assigned',
    title: 'Job Assigned',
    message: `You have been selected for job ${booking.bookingRef} by Farmer ${req.user.name}.`
  });

  return success(res, booking, 'Driver selected successfully.', 200);
});

module.exports = {
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
};
