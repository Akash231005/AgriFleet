const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ driverId: 1 });
ReviewSchema.index({ farmerId: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
