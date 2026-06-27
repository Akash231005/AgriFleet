const Tractor = require('../models/Tractor.model');
const Attachment = require('../models/Attachment.model');
const FuelRecord = require('../models/FuelRecord.model');
const MaintenanceRecord = require('../models/MaintenanceRecord.model');
const { success, error } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

// --- TRACTOR CONTROLLERS ---

// @desc    Get all tractors
// @route   GET /api/v1/tractors
// @access  Private
const getTractors = asyncWrapper(async (req, res) => {
  const { status } = req.query;
  const filter = { isActive: true };
  if (status) {
    filter.status = status;
  }
  const tractors = await Tractor.find(filter).populate('currentDriverId', 'phone');
  return success(res, tractors, 'Tractors list retrieved.', 200);
});

// @desc    Add a tractor to the fleet
// @route   POST /api/v1/tractors
// @access  Private (Admin / Fleet Manager)
const addTractor = asyncWrapper(async (req, res) => {
  const { registrationNo, model, brand, year, horsePower, fuelType, photo } = req.body;

  const exists = await Tractor.findOne({ registrationNo });
  if (exists) {
    return error(res, `Tractor with registration ${registrationNo} already exists.`, 400);
  }

  const tractor = await Tractor.create({
    registrationNo,
    model,
    brand,
    year,
    horsePower,
    fuelType,
    photo
  });

  return success(res, tractor, 'Tractor added to fleet successfully.', 201);
});

// @desc    Update tractor information
// @route   PATCH /api/v1/tractors/:id
// @access  Private (Admin / Fleet Manager)
const updateTractor = asyncWrapper(async (req, res) => {
  const tractor = await Tractor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!tractor) {
    return error(res, 'Tractor not found.', 404);
  }
  return success(res, tractor, 'Tractor updated successfully.', 200);
});

// --- ATTACHMENT CONTROLLERS ---

// @desc    Get all attachments
// @route   GET /api/v1/tractors/attachments
// @access  Private
const getAttachments = asyncWrapper(async (req, res) => {
  const { status } = req.query;
  const filter = { isActive: true };
  if (status) {
    filter.status = status;
  }
  const attachments = await Attachment.find(filter);
  return success(res, attachments, 'Attachments list retrieved.', 200);
});

// @desc    Add attachment
// @route   POST /api/v1/tractors/attachments
// @access  Private (Admin / Fleet Manager)
const addAttachment = asyncWrapper(async (req, res) => {
  const { name, type, brand, compatibleWith, photo } = req.body;

  const attachment = await Attachment.create({
    name,
    type,
    brand,
    compatibleWith,
    photo
  });

  return success(res, attachment, 'Attachment added successfully.', 201);
});

// @desc    Update attachment
// @route   PATCH /api/v1/tractors/attachments/:id
// @access  Private (Admin / Fleet Manager)
const updateAttachment = asyncWrapper(async (req, res) => {
  const attachment = await Attachment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!attachment) {
    return error(res, 'Attachment not found.', 404);
  }
  return success(res, attachment, 'Attachment updated successfully.', 200);
});

// --- FUEL CONTROLLERS ---

// @desc    Log a fuel transaction
// @route   POST /api/v1/tractors/fuel
// @access  Private (Admin / Fleet Manager)
const logFuel = asyncWrapper(async (req, res) => {
  const { tractorId, liters, pricePerL, totalCost, fuelStation, odometerKm, date } = req.body;

  const tractor = await Tractor.findById(tractorId);
  if (!tractor) {
    return error(res, 'Tractor not found.', 404);
  }

  const cost = totalCost || (liters * pricePerL);

  const fuelRecord = await FuelRecord.create({
    tractorId,
    liters,
    pricePerL,
    totalCost: cost,
    fuelStation,
    odometerKm,
    date: date ? new Date(date) : new Date(),
    recordedBy: req.user._id
  });

  // Simple telemetry updates
  if (odometerKm) {
    // update running hours approximation based on odometer ratio
    tractor.totalHoursRun += Math.round(liters * 0.2); 
  }
  tractor.fuelLevel = 100; // Refueled to full
  await tractor.save();

  return success(res, fuelRecord, 'Fuel transaction logged.', 201);
});

// @desc    Get fuel history
// @route   GET /api/v1/tractors/fuel
// @access  Private (Admin / Fleet Manager)
const getFuelHistory = asyncWrapper(async (req, res) => {
  const history = await FuelRecord.find()
    .populate('tractorId', 'registrationNo model')
    .sort({ date: -1 });
  return success(res, history, 'Fuel log retrieved.', 200);
});

// --- MAINTENANCE CONTROLLERS ---

// @desc    Log a maintenance activity
// @route   POST /api/v1/tractors/maintenance
// @access  Private (Admin / Fleet Manager)
const logMaintenance = asyncWrapper(async (req, res) => {
  const { tractorId, type, description, cost, technician, serviceCenter, serviceDate, nextDueDate, parts } = req.body;

  const tractor = await Tractor.findById(tractorId);
  if (!tractor) {
    return error(res, 'Tractor not found.', 404);
  }

  const record = await MaintenanceRecord.create({
    tractorId,
    type,
    description,
    cost,
    technician,
    serviceCenter,
    serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
    nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
    parts,
    recordedBy: req.user._id
  });

  // Update tractor values
  tractor.lastServiceDate = record.serviceDate;
  if (nextDueDate) {
    tractor.nextServiceDue = record.nextDueDate;
  }
  tractor.status = 'available'; // Set status back to available after logging maintenance completion
  await tractor.save();

  return success(res, record, 'Maintenance activity logged.', 201);
});

// @desc    Get maintenance logs
// @route   GET /api/v1/tractors/maintenance
// @access  Private (Admin / Fleet Manager)
const getMaintenanceHistory = asyncWrapper(async (req, res) => {
  const history = await MaintenanceRecord.find()
    .populate('tractorId', 'registrationNo model')
    .sort({ serviceDate: -1 });
  return success(res, history, 'Maintenance log history retrieved.', 200);
});

module.exports = {
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
};
