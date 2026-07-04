const Booking = require('../models/Booking.model');
const Tractor = require('../models/Tractor.model');
const Driver = require('../models/Driver.model');
const Attachment = require('../models/Attachment.model');
const User = require('../models/User.model');
const { success } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    Get KPIs operational summary
// @route   GET /api/v1/analytics/summary
// @access  Private (Admin / Fleet Manager)
const getOperationalSummary = asyncWrapper(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Parallelize sequential database queries
  const [
    todayBookingsCount,
    activeJobsCount,
    todayCompleted,
    totalTractors,
    availableTractors,
    totalFarmers,
    totalDrivers
  ] = await Promise.all([
    Booking.countDocuments({ scheduledDate: { $gte: startOfDay, $lte: endOfDay } }),
    Booking.countDocuments({ status: 'in_progress' }),
    Booking.find({ status: 'completed', completedAt: { $gte: startOfDay, $lte: endOfDay } }),
    Tractor.countDocuments({ isActive: true }),
    Tractor.countDocuments({ status: 'available', isActive: true }),
    User.countDocuments({ role: 'farmer' }),
  ]);

  const revenueToday = todayCompleted.reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  return success(res, {
    todayBookings: todayBookingsCount,
    activeJobs: activeJobsCount,
    revenueToday,
    fleetRatio: `${availableTractors}/${totalTractors}`,
    availableTractors,
    totalTractors,
    totalFarmers,
    totalDrivers
  }, 'Operational KPIs loaded.', 200);
});

// @desc    Get Revenue history charts
// @route   GET /api/v1/analytics/revenue
// @access  Private (Admin)
const getRevenueStats = asyncWrapper(async (req, res) => {
  // Let's query recent completed bookings and group by day
  const bookings = await Booking.find({ status: 'completed' })
    .select('completedAt actualCost workType')
    .sort({ completedAt: 1 });

  // Group by date (YYYY-MM-DD)
  const statsMap = {};
  bookings.forEach(b => {
    if (!b.completedAt) return;
    const dateStr = b.completedAt.toISOString().split('T')[0];
    if (!statsMap[dateStr]) {
      statsMap[dateStr] = { date: dateStr, revenue: 0, count: 0 };
    }
    statsMap[dateStr].revenue += b.actualCost || 0;
    statsMap[dateStr].count += 1;
  });

  const chartData = Object.values(statsMap);

  return success(res, chartData, 'Revenue stats loaded.', 200);
});

// @desc    Get Fleet utilization statistics
// @route   GET /api/v1/analytics/fleet
// @access  Private (Admin / Fleet Manager)
const getFleetUtilization = asyncWrapper(async (req, res) => {
  const [
    available,
    onJob,
    maintenance,
    inactive,
    attachmentsAvailable,
    attachmentsInUse
  ] = await Promise.all([
    Tractor.countDocuments({ status: 'available', isActive: true }),
    Tractor.countDocuments({ status: 'on_job', isActive: true }),
    Tractor.countDocuments({ status: 'maintenance', isActive: true }),
    Tractor.countDocuments({ status: 'inactive', isActive: true }),
    Attachment.countDocuments({ status: 'available', isActive: true }),
    Attachment.countDocuments({ status: 'in_use', isActive: true })
  ]);

  return success(res, {
    tractors: {
      available,
      onJob,
      maintenance,
      inactive,
      total: available + onJob + maintenance + inactive
    },
    attachments: {
      available: attachmentsAvailable,
      inUse: attachmentsInUse,
      total: attachmentsAvailable + attachmentsInUse
    }
  }, 'Fleet utilization loaded.', 200);
});

// @desc    Get Drivers performance list
// @route   GET /api/v1/analytics/drivers
// @access  Private (Admin)
const getDriverPerformance = asyncWrapper(async (req, res) => {
  const drivers = await Driver.find()
    .populate('userId', 'name email')
    .sort({ rating: -1, totalJobsDone: -1 })
    .limit(10);

  return success(res, drivers, 'Driver performance leaderboard loaded.', 200);
});

module.exports = {
  getOperationalSummary,
  getRevenueStats,
  getFleetUtilization,
  getDriverPerformance
};
