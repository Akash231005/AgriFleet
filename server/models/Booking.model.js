const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingRef: { type: String, unique: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  tractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor' },
  attachmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  
  workType: { 
    type: String, 
    enum: ['ploughing', 'rotavating', 'seeding', 'spraying', 'harvesting', 'transportation'],
    required: true 
  },
  areaAcres: { type: Number, required: true, min: 0.5 },
  fieldLocation: {
    address: String,
    village: String,
    coordinates: { type: [Number], index: '2dsphere', default: [77.5946, 12.9716] } // [lng, lat]
  },
  
  scheduledDate: { type: Date, required: true },
  timeSlot: { type: String, enum: ['morning', 'afternoon', 'evening'], default: 'morning' },
  
  estimatedHours: { type: Number },
  estimatedFuel: { type: Number },
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  startedAt: { type: Date },
  completedAt: { type: Date },
  
  workPhotos: [{ type: String }],
  driverNotes: { type: String },
  adminNotes: { type: String },
  
  cancelReason: { type: String },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BookingSchema.index({ farmerId: 1, status: 1 });
BookingSchema.index({ driverId: 1, scheduledDate: 1 });
BookingSchema.index({ tractorId: 1, scheduledDate: 1 });
BookingSchema.index({ status: 1, scheduledDate: 1 });
BookingSchema.index({ bookingRef: 1 });

BookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await mongoose.model('Booking').countDocuments();
      this.bookingRef = `AF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
