const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  type: { 
    type: String, 
    enum: ['booking_confirmed', 'driver_assigned', 'job_started', 'job_completed', 
           'payment_due', 'payment_received', 'maintenance_due', 'system'],
    default: 'system'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  channel: { type: String, enum: ['in_app', 'email', 'sms'], default: 'in_app' },
  sentAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ sentAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
