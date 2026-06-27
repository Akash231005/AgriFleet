const Booking = require('../models/Booking.model');
const Tractor = require('../models/Tractor.model');
const Attachment = require('../models/Attachment.model');
const Driver = require('../models/Driver.model');

const WORK_TYPE_TO_ATTACHMENT = {
  ploughing: 'plough',
  rotavating: 'rotavator',
  seeding: 'seeder',
  spraying: 'sprayer',
  harvesting: 'harvester',
  transportation: 'trailer'
};

/**
 * Automatically assigns available resources to a booking for its scheduled date.
 * @param {object} booking - Booking mongoose document
 * @returns {Promise<object>} { tractor, attachment, driver }
 */
const allocateResources = async (booking) => {
  const { workType, scheduledDate } = booking;

  // 1. Establish start and end of target day (UTC)
  const dayStart = new Date(scheduledDate);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(scheduledDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // 2. Fetch busy resource IDs for active bookings on this day
  const activeBookings = await Booking.find({
    scheduledDate: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['confirmed', 'assigned', 'in_progress'] },
    _id: { $ne: booking._id } // exclude current booking itself
  }).select('tractorId driverId attachmentId');

  const busyTractors = activeBookings.map(b => b.tractorId).filter(Boolean);
  const busyDrivers = activeBookings.map(b => b.driverId).filter(Boolean);
  const busyAttachments = activeBookings.map(b => b.attachmentId).filter(Boolean);

  // 3. Find compatible available Tractor
  const tractor = await Tractor.findOne({
    status: 'available',
    isActive: true,
    _id: { $nin: busyTractors }
  });

  if (!tractor) {
    throw new Error('NO_TRACTOR_AVAILABLE');
  }

  // 4. Find compatible available Attachment
  const requiredType = WORK_TYPE_TO_ATTACHMENT[workType];
  const attachment = await Attachment.findOne({
    type: requiredType,
    status: 'available',
    isActive: true,
    _id: { $nin: busyAttachments }
  });

  if (!attachment) {
    throw new Error('NO_ATTACHMENT_AVAILABLE');
  }

  // 5. Find compatible available Driver (prioritizing highest rating)
  const driver = await Driver.findOne({
    status: 'available',
    approvalStatus: 'APPROVED',
    isApproved: true,
    _id: { $nin: busyDrivers }
  }).sort({ rating: -1, joinedAt: 1 });

  if (!driver) {
    throw new Error('NO_DRIVER_AVAILABLE');
  }

  return { tractor, attachment, driver };
};

module.exports = {
  allocateResources,
  WORK_TYPE_TO_ATTACHMENT
};
