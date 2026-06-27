const mongoose = require('mongoose');

const JobRequestSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'selected', 'not_selected'], 
    default: 'pending' 
  },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
});

// Ensure a driver can only request a specific job once
JobRequestSchema.index({ bookingId: 1, driverId: 1 }, { unique: true });
JobRequestSchema.index({ driverId: 1, status: 1 });

module.exports = mongoose.model('JobRequest', JobRequestSchema);
