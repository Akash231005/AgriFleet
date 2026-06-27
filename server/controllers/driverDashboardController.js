const Driver = require('../models/Driver.model');
const Booking = require('../models/Booking.model');
const Farmer = require('../models/Farmer.model');
const JobRequest = require('../models/JobRequest.model');
const Tractor = require('../models/Tractor.model');
const Attachment = require('../models/Attachment.model');
const Notification = require('../models/Notification.model');
const { success, error } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// 1. Toggle Status (Online/Offline)
// PATCH /api/driver/dashboard/toggle-status
const toggleStatus = asyncWrapper(async (req, res) => {
  const driver = req.driver;
  driver.isOnline = !driver.isOnline;
  await driver.save();
  return success(res, { isOnline: driver.isOnline }, 'Online status toggled.', 200);
});

// 2. Overview Tab
// GET /api/driver/dashboard/overview
const getOverview = asyncWrapper(async (req, res) => {
  const driver = req.driver;

  // 1. Today's earnings
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const completedToday = await Booking.find({
    driverId: driver._id,
    status: 'completed',
    scheduledDate: { $gte: startOfToday, $lte: endOfToday }
  });

  const todayEarnings = completedToday.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  // 2. Lifetime jobs completed
  const totalJobs = await Booking.countDocuments({
    driverId: driver._id,
    status: 'completed'
  });

  // 3. Count of assigned jobs (upcoming/new assignments)
  const availableJobsCount = await Booking.countDocuments({
    driverId: driver._id,
    status: { $in: ['assigned', 'accepted'] }
  });

  // 4. Assigned Job (active job: assigned, accepted, or in_progress)
  const activeBooking = await Booking.findOne({
    driverId: driver._id,
    status: { $in: ['assigned', 'accepted', 'in_progress'] }
  }).populate({
    path: 'farmerId',
    populate: { path: 'userId', select: 'name' }
  });

  let assignedJob = null;
  if (activeBooking) {
    assignedJob = {
      id: activeBooking._id,
      bookingRef: activeBooking.bookingRef,
      workType: activeBooking.workType,
      areaAcres: activeBooking.areaAcres,
      scheduledDate: activeBooking.scheduledDate,
      timeSlot: activeBooking.timeSlot,
      estimatedCost: activeBooking.estimatedCost,
      status: activeBooking.status,
      location: activeBooking.fieldLocation?.address || activeBooking.fieldLocation?.village || 'In field',
      farmerName: activeBooking.farmerId?.userId?.name || 'Farmer',
      farmerPhone: activeBooking.farmerId?.phone || ''
    };
  }

  // 5. Recent Activity Feed
  // Fetch bids submitted
  const bids = await JobRequest.find({ driverId: driver._id })
    .sort({ requestedAt: -1 })
    .limit(5)
    .populate('bookingId', 'bookingRef');
  
  const bidActivities = bids.map(b => ({
    message: `Bid submitted on Job #${b.bookingId?.bookingRef || 'N/A'}`,
    date: b.requestedAt
  }));

  // Fetch completed or assigned bookings
  const bookings = await Booking.find({ driverId: driver._id })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate({
      path: 'farmerId',
      populate: { path: 'userId', select: 'name' }
    });

  const bookingActivities = bookings.map(b => {
    let msg = `Job #${b.bookingRef} updated to ${b.status}`;
    if (b.status === 'assigned') {
      msg = `Job #${b.bookingRef} assigned by Farmer ${b.farmerId?.userId?.name || 'Partner'}`;
    } else if (b.status === 'completed') {
      msg = `Job #${b.bookingRef} marked completed! Payout processed.`;
    }
    return {
      message: msg,
      date: b.updatedAt || b.scheduledDate
    };
  });

  const recentActivity = [...bidActivities, ...bookingActivities]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return success(res, {
    todayEarnings,
    totalJobsCompleted: totalJobs || driver.totalJobsDone || 0,
    rating: driver.rating || 0,
    availableJobsCount,
    assignedJob,
    recentActivity
  }, 'Driver overview data fetched.', 200);
});

// 3. Available Jobs Tab
// GET /api/driver/dashboard/available-jobs
const getAvailableJobs = asyncWrapper(async (req, res) => {
  const driver = req.driver;
  const driverDistrict = driver.address?.district || '';

  if (!driverDistrict) {
    return success(res, [], 'Please configure your district in profile to find jobs.', 200);
  }

  // Find all farmers in the driver's district
  const farmersInDistrict = await Farmer.find({ district: driverDistrict }).select('_id');
  const farmerIds = farmersInDistrict.map(f => f._id);

  // Find pending bookings in this district
  const pendingBookings = await Booking.find({
    status: 'pending',
    farmerId: { $in: farmerIds }
  }).populate({
    path: 'farmerId',
    populate: { path: 'userId', select: 'name' }
  });

  // Filter out bookings driver has already bid on
  const bids = await JobRequest.find({ driverId: driver._id }).select('bookingId');
  const bidBookingIds = new Set(bids.map(b => b.bookingId.toString()));

  const available = pendingBookings
    .filter(b => !bidBookingIds.has(b._id.toString()))
    .map(b => ({
      id: b._id,
      bookingRef: b.bookingRef,
      workType: b.workType,
      areaAcres: b.areaAcres,
      scheduledDate: b.scheduledDate,
      timeSlot: b.timeSlot,
      estimatedCost: b.estimatedCost,
      location: b.fieldLocation?.address || b.fieldLocation?.village || 'In field',
      farmerName: b.farmerId?.userId?.name || 'Farmer'
    }));

  return success(res, available, 'Available jobs fetched.', 200);
});

// @deprecated - Marketplace logic (use getMyJobs instead)
// 4. Request Job (Bidding)
// POST /api/driver/dashboard/request-job
const requestJob = asyncWrapper(async (req, res) => {
  const { bookingId } = req.body;
  const driver = req.driver;

  if (!bookingId) {
    return error(res, 'Booking ID is required to bid.', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== 'pending') {
    return error(res, 'Booking is no longer active or available.', 400);
  }

  // Check if bid already exists
  const existingRequest = await JobRequest.findOne({ bookingId, driverId: driver._id });
  if (existingRequest) {
    return error(res, 'You have already requested this job.', 400);
  }

  await JobRequest.create({
    bookingId,
    driverId: driver._id,
    status: 'pending'
  });

  return success(res, null, 'Job request submitted successfully.', 201);
});

// 5. GET /api/driver/dashboard/my-jobs
const getMyJobsDashboard = asyncWrapper(async (req, res) => {
  const driver = req.driver;

  const jobs = await Booking.find({
    driverId: driver._id,
    status: { $in: ['assigned', 'accepted', 'in_progress'] }
  })
  .populate({ path: 'farmerId', populate: { path: 'userId', select: 'name phone' } })
  .populate('tractorId')
  .populate('attachmentId')
  .sort({ scheduledDate: 1 });

  return success(res, jobs, 'Assigned tasks fetched.', 200);
});

// 6. PATCH /api/driver/dashboard/jobs/:id/accept
const acceptJobDashboard = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  const driver = req.driver;
  if (String(booking.driverId) !== String(driver._id)) {
    return error(res, 'You are not assigned to perform this job.', 403);
  }

  if (booking.status !== 'assigned') {
    return error(res, `Cannot accept task from current status: ${booking.status}`, 400);
  }

  booking.status = 'accepted';
  await booking.save();

  // Notify farmer
  const farmerProfile = await Farmer.findById(booking.farmerId);
  if (farmerProfile) {
    await Notification.create({
      userId: farmerProfile.userId,
      bookingId: booking._id,
      type: 'driver_assigned',
      title: 'Service Accepted',
      message: `Your booking request ${booking.bookingRef} has been accepted by driver ${driver.name}.`
    });
  }

  return success(res, booking, 'Job marked as accepted.', 200);
});

// 7. PATCH /api/driver/dashboard/jobs/:id/start
const startJobDashboard = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  const driver = req.driver;
  if (String(booking.driverId) !== String(driver._id)) {
    return error(res, 'You are not assigned to perform this job.', 403);
  }

  if (booking.status !== 'accepted' && booking.status !== 'assigned') {
    return error(res, `Cannot start task from current status: ${booking.status}`, 400);
  }

  booking.status = 'in_progress';
  booking.startedAt = new Date();
  await booking.save();

  // Notify farmer
  const farmerProfile = await Farmer.findById(booking.farmerId);
  if (farmerProfile) {
    await Notification.create({
      userId: farmerProfile.userId,
      bookingId: booking._id,
      type: 'job_started',
      title: 'Service In Progress',
      message: `Your agricultural service ${booking.bookingRef} has started.`
    });
  }

  return success(res, booking, 'Job marked as started.', 200);
});

// 8. PATCH /api/driver/dashboard/jobs/:id/complete
const completeJobDashboard = asyncWrapper(async (req, res) => {
  const { workPhotos, driverNotes } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  const driver = req.driver;
  if (String(booking.driverId) !== String(driver._id)) {
    return error(res, 'You are not authorized to complete this job.', 403);
  }

  if (booking.status !== 'in_progress') {
    return error(res, `Cannot complete task from status: ${booking.status}`, 400);
  }

  // Update Booking status
  booking.status = 'completed';
  booking.completedAt = new Date();
  booking.workPhotos = workPhotos || [];
  booking.driverNotes = driverNotes || '';
  booking.actualCost = booking.estimatedCost; // default actual to estimated
  await booking.save();

  // Free driver status
  driver.status = 'available';
  driver.totalJobsDone += 1;
  const taskEarnings = Math.round(booking.estimatedCost * 0.15);
  driver.totalEarnings += taskEarnings;
  await driver.save();

  // Free equipment
  if (booking.tractorId) {
    await Tractor.findByIdAndUpdate(booking.tractorId, { status: 'available', currentDriverId: null });
  }
  if (booking.attachmentId) {
    await Attachment.findByIdAndUpdate(booking.attachmentId, { status: 'available', currentTractorId: null });
  }

  // Notify Farmer
  const farmerProfile = await Farmer.findById(booking.farmerId);
  if (farmerProfile) {
    await Notification.create({
      userId: farmerProfile.userId,
      bookingId: booking._id,
      type: 'job_completed',
      title: 'Service Completed',
      message: `Service ${booking.bookingRef} is complete. Please rate the experience and complete payment.`
    });
  }

  return success(res, booking, 'Job completed successfully.', 200);
});

// 9. Job History Tab
// GET /api/driver/dashboard/job-history
const getJobHistory = asyncWrapper(async (req, res) => {
  const driver = req.driver;

  const history = await Booking.find({
    driverId: driver._id,
    status: { $in: ['completed', 'cancelled'] }
  })
  .sort({ scheduledDate: -1 })
  .populate({
    path: 'farmerId',
    populate: { path: 'userId', select: 'name' }
  });

  const formattedHistory = history.map(b => ({
    id: b._id,
    bookingRef: b.bookingRef,
    workType: b.workType,
    areaAcres: b.areaAcres,
    scheduledDate: b.scheduledDate,
    timeSlot: b.timeSlot,
    actualCost: b.actualCost || b.estimatedCost || 0,
    status: b.status,
    location: b.fieldLocation?.address || b.fieldLocation?.village || 'In field',
    farmerName: b.farmerId?.userId?.name || 'Farmer'
  }));

  return success(res, formattedHistory, 'Job history fetched.', 200);
});

// 10. Payments Tab
// GET /api/driver/dashboard/payments
const getPayments = asyncWrapper(async (req, res) => {
  const driver = req.driver;

  // 1. Lifetime Earnings (driver total field or aggregate)
  const completedJobs = await Booking.find({
    driverId: driver._id,
    status: 'completed'
  }).sort({ scheduledDate: -1 });

  const lifetimeEarnings = completedJobs.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  // 2. Current Month Earnings
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEarnings = completedJobs
    .filter(b => new Date(b.scheduledDate) >= startOfMonth)
    .reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  // 3. Last Week Earnings
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - 7);
  const lastWeekEarnings = completedJobs
    .filter(b => new Date(b.scheduledDate) >= startOfWeek)
    .reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  // 4. Earnings breakdown (last 7 completed jobs details)
  const payouts = completedJobs.slice(0, 7).map(b => ({
    date: b.scheduledDate,
    bookingRef: b.bookingRef,
    amount: b.actualCost || b.estimatedCost || 0
  }));

  // 5. Monthly chart data (last 6 months)
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthAmount = completedJobs
      .filter(b => {
        const date = new Date(b.scheduledDate);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

    chartData.push({
      name: monthName,
      amount: monthAmount
    });
  }

  return success(res, {
    lifetimeEarnings: lifetimeEarnings || driver.totalEarnings || 0,
    currentMonthEarnings,
    lastWeekEarnings,
    payouts,
    chartData
  }, 'Payments breakdown fetched.', 200);
});

module.exports = {
  toggleStatus,
  getOverview,
  getAvailableJobs,
  requestJob,
  getMyJobsDashboard,
  acceptJobDashboard,
  startJobDashboard,
  completeJobDashboard,
  getJobHistory,
  getPayments
};
