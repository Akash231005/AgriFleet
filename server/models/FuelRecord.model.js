const mongoose = require('mongoose');

const FuelRecordSchema = new mongoose.Schema({
  tractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  liters: { type: Number, required: true },
  pricePerL: { type: Number },
  totalCost: { type: Number },
  fuelStation: { type: String },
  odometerKm: { type: Number },
  date: { type: Date, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

FuelRecordSchema.index({ tractorId: 1, date: -1 });

module.exports = mongoose.model('FuelRecord', FuelRecordSchema);
