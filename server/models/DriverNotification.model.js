const mongoose = require('mongoose');

const DriverNotificationSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'registration_submitted', 
      'application_approved', 
      'application_rejected', 
      'docs_requested', 
      'account_suspended', 
      'system'
    ],
    default: 'system'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now }
});

DriverNotificationSchema.index({ driverId: 1, isRead: 1 });
DriverNotificationSchema.index({ sentAt: -1 });

module.exports = mongoose.model('DriverNotification', DriverNotificationSchema);
