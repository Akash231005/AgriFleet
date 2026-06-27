const mongoose = require('mongoose');

const MaintenanceRecordSchema = new mongoose.Schema({
  tractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor', required: true },
  type: { type: String, enum: ['oil_change', 'tyre', 'engine', 'hydraulic', 'electrical', 'general', 'accident'], required: true },
  description: { type: String },
  cost: { type: Number, required: true },
  technician: { type: String },
  serviceCenter: { type: String },
  serviceDate: { type: Date, required: true },
  nextDueDate: { type: Date },
  nextDueMiles: { type: Number },
  hoursAtService: { type: Number },
  parts: [{ name: String, cost: Number }],
  photos: [{ type: String }],
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

MaintenanceRecordSchema.index({ tractorId: 1, serviceDate: -1 });

module.exports = mongoose.model('MaintenanceRecord', MaintenanceRecordSchema);
