const mongoose = require('mongoose');

const TractorSchema = new mongoose.Schema({
  registrationNo: { type: String, required: true, unique: true, trim: true },
  model: { type: String, required: true },
  brand: { type: String },
  year: { type: Number },
  horsePower: { type: Number },
  fuelType: { type: String, enum: ['diesel', 'petrol', 'electric'], default: 'diesel' },
  status: { type: String, enum: ['available', 'on_job', 'maintenance', 'inactive'], default: 'available' },
  currentDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  fuelLevel: { type: Number, min: 0, max: 100, default: 100 },
  totalHoursRun: { type: Number, default: 0 },
  lastServiceDate: { type: Date },
  nextServiceDue: { type: Date },
  insuranceExpiry: { type: Date },
  photo: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [77.5946, 12.9716] }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

TractorSchema.index({ status: 1 });
TractorSchema.index({ registrationNo: 1 });
TractorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Tractor', TractorSchema);
