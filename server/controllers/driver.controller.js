const User = require('../models/User.model');
const Farmer = require('../models/Farmer.model');
const Driver = require('../models/Driver.model');
const Booking = require('../models/Booking.model');
const Tractor = require('../models/Tractor.model');
const Attachment = require('../models/Attachment.model');
const Notification = require('../models/Notification.model');
const DriverDocument = require('../models/DriverDocument.model');
const DriverApplication = require('../models/DriverApplication.model');
const DriverBankDetails = require('../models/DriverBankDetails.model');
const DriverNotification = require('../models/DriverNotification.model');
const { saveBase64File } = require('../utils/fileSaver');
const { success, error } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// @desc    List all drivers (Admin/Fleet view)
// @route   GET /api/v1/drivers
// @access  Private (Admin / Fleet Manager)
const getDrivers = asyncWrapper(async (req, res) => {
  const drivers = await Driver.find().populate('userId', 'name email phone isActive');
  return success(res, drivers, 'Drivers list retrieved.', 200);
});

// @desc    Create a new driver account
// @route   POST /api/v1/drivers
// @access  Private (Admin)
const createDriver = asyncWrapper(async (req, res) => {
  const { name, email, password, phone, licenseNumber, licenseExpiry, profilePhoto } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return error(res, 'Email address is already in use.', 400);
  }

  // Create base User with role 'driver'
  const user = await User.create({
    name,
    email,
    password,
    role: 'driver',
    phone
  });

  // Create Driver record
  const driver = await Driver.create({
    userId: user._id,
    phone,
    licenseNumber,
    licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
    profilePhoto
  });

  user.password = undefined;
  return success(res, { user, driver }, 'Driver account created successfully.', 201);
});

// @desc    Get active/assigned tasks for logged in driver
// @route   GET /api/v1/drivers/my/jobs
// @access  Private (Driver)
const getMyJobs = asyncWrapper(async (req, res) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }

  if (driver.approvalStatus !== 'APPROVED') {
    return error(res, 'Access denied. Your driver account is pending approval.', 403);
  }

  const jobs = await Booking.find({
    driverId: driver._id,
    status: { $in: ['assigned', 'in_progress'] }
  })
  .populate({ path: 'farmerId', populate: { path: 'userId', select: 'name phone' } })
  .populate('tractorId')
  .populate('attachmentId')
  .sort({ scheduledDate: 1 });

  return success(res, jobs, 'Assigned tasks fetched.', 200);
});

// @desc    Start job execution
// @route   PATCH /api/v1/bookings/:id/start
// @access  Private (Driver)
const startJob = asyncWrapper(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }

  if (driver.approvalStatus !== 'APPROVED') {
    return error(res, 'Access denied. Your driver account is not approved yet.', 403);
  }

  if (String(booking.driverId) !== String(driver._id)) {
    return error(res, 'You are not assigned to perform this job.', 403);
  }

  if (booking.status !== 'assigned') {
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

// @desc    Mark job as completed
// @route   PATCH /api/v1/bookings/:id/complete
// @access  Private (Driver)
const completeJob = asyncWrapper(async (req, res) => {
  const { workPhotos, driverNotes } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return error(res, 'Booking record not found.', 404);
  }

  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }

  if (driver.approvalStatus !== 'APPROVED') {
    return error(res, 'Access denied. Your driver account is not approved yet.', 403);
  }

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
  // earnings estimation: simulate driver payout (e.g. 15% of cost)
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

// @desc    Get stats for logged in driver
// @route   GET /api/v1/drivers/my/stats
// @access  Private (Driver)
const getDriverStats = asyncWrapper(async (req, res) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }

  if (driver.approvalStatus !== 'APPROVED') {
    return error(res, 'Access denied. Your driver account is not approved yet.', 403);
  }

  // Fetch completed bookings count and listings
  const completedJobs = await Booking.find({ driverId: driver._id, status: 'completed' })
    .select('bookingRef workType areaAcres completedAt estimatedCost')
    .sort({ completedAt: -1 });

  return success(res, {
    rating: driver.rating,
    totalJobsDone: driver.totalJobsDone,
    totalEarnings: driver.totalEarnings,
    licenseNumber: driver.licenseNumber,
    licenseExpiry: driver.licenseExpiry,
    completedJobs
  }, 'Driver statistics fetched.', 200);
});

// --- Helper: Generate Driver ID (DRV-YYYY-NNNN) ---
const generateDriverId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `DRV-${currentYear}-`;
  
  // Find drivers whose driverId matches DRV-YYYY-XXXX
  const regex = new RegExp(`^${prefix}(\\d{4})$`);
  
  // Since mongoose query regex sorting on string can be tricky, let's load matches and find max
  const matches = await mongoose.model('Driver').find({ driverId: { $regex: `^${prefix}` } }).select('driverId');
  
  let nextNum = 1;
  if (matches && matches.length > 0) {
    const nums = matches.map(m => {
      const match = m.driverId.match(regex);
      return match ? parseInt(match[1], 10) : 0;
    });
    nextNum = Math.max(...nums) + 1;
  }

  const paddedNum = String(nextNum).padStart(4, '0');
  return `${prefix}${paddedNum}`;
};

// @desc    Get full profile details for logged in driver
// @route   GET /api/v1/drivers/my/profile
// @access  Private (Driver)
const getDriverProfile = asyncWrapper(async (req, res) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }
  const bank = await DriverBankDetails.findOne({ driverId: driver._id });
  const documents = await DriverDocument.find({ driverId: driver._id });
  const user = await User.findById(req.user._id).select('-password');
  return success(res, { user, driver, bank, documents }, 'Driver profile retrieved successfully.', 200);
});

// @desc    Update driver profile & bank details
// @route   PATCH /api/v1/drivers/my/profile
// @access  Private (Driver)
const updateDriverProfile = asyncWrapper(async (req, res) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }

  const { phone, emergencyContact, bankDetails } = req.body;

  if (phone) {
    driver.phone = phone;
    await User.findByIdAndUpdate(req.user._id, { phone });
  }
  if (emergencyContact) {
    driver.emergencyContact = emergencyContact;
  }
  await driver.save();

  let bank = null;
  if (bankDetails) {
    bank = await DriverBankDetails.findOneAndUpdate(
      { driverId: driver._id },
      {
        accountHolderName: bankDetails.accountHolderName,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        upiId: bankDetails.upiId
      },
      { new: true, upsert: true }
    );
  } else {
    bank = await DriverBankDetails.findOne({ driverId: driver._id });
  }

  const documents = await DriverDocument.find({ driverId: driver._id });
  const user = await User.findById(req.user._id).select('-password');

  return success(res, { user, driver, bank, documents }, 'Profile details updated successfully.', 200);
});

// @desc    Reupload requested documents for drivers
// @route   PATCH /api/v1/drivers/my/reupload-documents
// @access  Private (Driver)
const reuploadDriverDocuments = asyncWrapper(async (req, res) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }

  if (driver.approvalStatus !== 'DOCS_REQUESTED' && driver.approvalStatus !== 'REJECTED') {
    return error(res, 'You can only re-upload documents if requested by the administrator.', 400);
  }

  const { documents } = req.body; // { [docType]: base64Data }
  if (!documents || typeof documents !== 'object') {
    return error(res, 'Please provide the documents to re-upload.', 400);
  }

  const driverIdStr = req.user._id.toString();
  const savedDocs = [];

  for (const [docType, base64Data] of Object.entries(documents)) {
    if (base64Data) {
      try {
        const fileUrl = saveBase64File(base64Data, 'documents', driverIdStr, docType);
        if (fileUrl) {
          // Delete existing document entry
          await DriverDocument.deleteMany({ driverId: driver._id, documentType: docType });
          
          const document = await DriverDocument.create({
            driverId: driver._id,
            documentType: docType,
            fileUrl,
            status: 'pending'
          });
          savedDocs.push(document);
        }
      } catch (err) {
        console.error(`Error re-saving document ${docType}:`, err.message);
      }
    }
  }

  // Reset status to PENDING_APPROVAL
  driver.approvalStatus = 'PENDING_APPROVAL';
  driver.documentRequestComments = '';
  await driver.save();

  // Log history in DriverApplication
  await DriverApplication.findOneAndUpdate(
    { driverId: driver._id },
    {
      status: 'PENDING_APPROVAL',
      $push: {
        history: {
          status: 'PENDING_APPROVAL',
          comments: 'Documents re-submitted by driver.',
          updatedAt: new Date()
        }
      }
    },
    { upsert: true }
  );

  // Notify driver via DriverNotification
  await DriverNotification.create({
    driverId: driver._id,
    type: 'registration_submitted',
    title: 'Documents Re-submitted',
    message: 'Your revised documents have been received. We will review your application shortly.'
  });

  return success(res, { driver }, 'Documents re-submitted. Your application status is now PENDING_APPROVAL.', 200);
});

// @desc    Get notifications for logged in driver
// @route   GET /api/v1/drivers/my/notifications
// @access  Private (Driver)
const getDriverNotifications = asyncWrapper(async (req, res) => {
  const driver = await Driver.findOne({ userId: req.user._id });
  if (!driver) {
    return error(res, 'Driver profile not found.', 404);
  }
  const notifications = await DriverNotification.find({ driverId: driver._id })
    .sort({ sentAt: -1 });
  return success(res, notifications, 'Notifications fetched successfully.', 200);
});

// @desc    Mark a driver notification as read
// @route   PATCH /api/v1/drivers/my/notifications/:id/read
// @access  Private (Driver)
const readDriverNotification = asyncWrapper(async (req, res) => {
  const notification = await DriverNotification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  return success(res, notification, 'Notification marked as read.', 200);
});

// @desc    Upload doc standalone (Base64)
// @route   POST /api/v1/drivers/upload-document
// @access  Private (Driver)
const uploadDocumentBase64 = asyncWrapper(async (req, res) => {
  const { documentType, base64Data } = req.body;
  if (!documentType || !base64Data) {
    return error(res, 'Document type and base64 data are required.', 400);
  }
  const userIdStr = req.user._id.toString();
  const fileUrl = saveBase64File(base64Data, 'documents', userIdStr, documentType);
  return success(res, { fileUrl }, 'Document uploaded successfully.', 200);
});

// --- ADMIN MANAGEMENT ENDPOINTS ---

// @desc    Get all driver applications (Admin view)
// @route   GET /api/v1/drivers/admin/applications
// @access  Private (Admin)
const getDriverApplications = asyncWrapper(async (req, res) => {
  const { status } = req.query; // PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
  const query = {};
  if (status) {
    query.approvalStatus = status;
  }

  const drivers = await Driver.find(query)
    .populate('userId', 'name email phone isActive lastLogin')
    .sort({ joinedAt: -1 });

  return success(res, drivers, 'Driver applications retrieved successfully.', 200);
});

// @desc    Get single application details including bank details & docs (Admin view)
// @route   GET /api/v1/drivers/admin/applications/:id
// @access  Private (Admin)
const getDriverApplicationDetails = asyncWrapper(async (req, res) => {
  const driver = await Driver.findById(req.params.id)
    .populate('userId', 'name email phone isActive lastLogin');
  if (!driver) {
    return error(res, 'Driver record not found.', 404);
  }
  const bank = await DriverBankDetails.findOne({ driverId: driver._id });
  const documents = await DriverDocument.find({ driverId: driver._id });
  const application = await DriverApplication.findOne({ driverId: driver._id });

  return success(res, { driver, bank, documents, application }, 'Application details retrieved.', 200);
});

// @desc    Approve driver registration, generate driverId & active account
// @route   PATCH /api/v1/drivers/admin/applications/:id/approve
// @access  Private (Admin)
const approveDriverApplication = asyncWrapper(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return error(res, 'Driver record not found.', 404);
  }

  if (driver.approvalStatus === 'APPROVED') {
    return error(res, 'Driver account is already approved.', 400);
  }

  // Generate driver ID
  const generatedId = await generateDriverId();

  driver.approvalStatus = 'APPROVED';
  driver.driverId = generatedId;
  driver.status = 'available'; // Set status to available immediately
  await driver.save();

  // Ensure base User account is active
  await User.findByIdAndUpdate(driver.userId, { isActive: true });

  // Update application collection
  await DriverApplication.findOneAndUpdate(
    { driverId: driver._id },
    {
      status: 'APPROVED',
      $push: {
        history: {
          status: 'APPROVED',
          comments: `Application approved. Assigned Driver ID: ${generatedId}`,
          updatedBy: req.user._id,
          updatedAt: new Date()
        }
      }
    },
    { upsert: true }
  );

  // Create notification for driver
  await DriverNotification.create({
    driverId: driver._id,
    type: 'application_approved',
    title: 'Application Approved!',
    message: `Congratulations! Your AgriFleet driver application has been approved. Your Driver ID is ${generatedId}. You now have full access to the platform.`
  });

  return success(res, { driver }, `Driver application approved. Assigned ID: ${generatedId}`, 200);
});

// @desc    Reject driver application with a reason
// @route   PATCH /api/v1/drivers/admin/applications/:id/reject
// @access  Private (Admin)
const rejectDriverApplication = asyncWrapper(async (req, res) => {
  const { rejectionReason } = req.body;
  if (!rejectionReason) {
    return error(res, 'Please provide a reason for rejection.', 400);
  }

  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return error(res, 'Driver record not found.', 404);
  }

  driver.approvalStatus = 'REJECTED';
  driver.rejectionReason = rejectionReason;
  driver.rejectionHistory.push({ reason: rejectionReason });
  await driver.save();

  // Update application collection
  await DriverApplication.findOneAndUpdate(
    { driverId: driver._id },
    {
      status: 'REJECTED',
      rejectionReason,
      $push: {
        history: {
          status: 'REJECTED',
          comments: `Application rejected: ${rejectionReason}`,
          updatedBy: req.user._id,
          updatedAt: new Date()
        }
      }
    },
    { upsert: true }
  );

  // Create notification
  await DriverNotification.create({
    driverId: driver._id,
    type: 'application_rejected',
    title: 'Application Rejected',
    message: `Your application was rejected: ${rejectionReason}. Please contact admin or update your application.`
  });

  return success(res, { driver }, 'Driver application rejected successfully.', 200);
});

// @desc    Request additional documents with specific comments
// @route   PATCH /api/v1/drivers/admin/applications/:id/request-docs
// @access  Private (Admin)
const requestAdditionalDocuments = asyncWrapper(async (req, res) => {
  const { comments } = req.body;
  if (!comments) {
    return error(res, 'Please provide feedback comments on what documents are needed.', 400);
  }

  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return error(res, 'Driver record not found.', 404);
  }

  driver.approvalStatus = 'DOCS_REQUESTED';
  driver.documentRequestComments = comments;
  await driver.save();

  // Update application collection
  await DriverApplication.findOneAndUpdate(
    { driverId: driver._id },
    {
      status: 'DOCS_REQUESTED',
      documentRequestComments: comments,
      $push: {
        history: {
          status: 'DOCS_REQUESTED',
          comments: `Documents requested: ${comments}`,
          updatedBy: req.user._id,
          updatedAt: new Date()
        }
      }
    },
    { upsert: true }
  );

  // Create notification
  await DriverNotification.create({
    driverId: driver._id,
    type: 'docs_requested',
    title: 'Additional Documents Required',
    message: `Admin has requested document changes: ${comments}. Please upload the renewed documents in your dashboard.`
  });

  return success(res, { driver }, 'Additional documents requested successfully.', 200);
});

// @desc    Suspend driver account
// @route   PATCH /api/v1/drivers/admin/applications/:id/suspend
// @access  Private (Admin)
const suspendDriver = asyncWrapper(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return error(res, 'Driver record not found.', 404);
  }

  driver.approvalStatus = 'SUSPENDED';
  driver.status = 'inactive';
  await driver.save();

  // Update application collection
  await DriverApplication.findOneAndUpdate(
    { driverId: driver._id },
    {
      status: 'SUSPENDED',
      $push: {
        history: {
          status: 'SUSPENDED',
          comments: 'Driver account suspended by administrator.',
          updatedBy: req.user._id,
          updatedAt: new Date()
        }
      }
    },
    { upsert: true }
  );

  // Create notification
  await DriverNotification.create({
    driverId: driver._id,
    type: 'account_suspended',
    title: 'Account Suspended',
    message: 'Your account has been suspended by the administrator. Platform access is disabled.'
  });

  return success(res, { driver }, 'Driver account suspended successfully.', 200);
});

const mongoose = require('mongoose');

module.exports = {
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
};
