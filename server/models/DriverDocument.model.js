const mongoose = require('mongoose');

const DriverDocumentSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  documentType: { 
    type: String, 
    required: true,
    enum: [
      'passport_photo', 
      'aadhaar_front', 
      'aadhaar_back', 
      'pan_card', 
      'dl_front', 
      'dl_back', 
      'tractor_cert', 
      'bank_passbook', 
      'police_verification', 
      'medical_fitness',
      // Optional
      'prev_employment', 
      'add_cert', 
      'training_cert'
    ]
  },
  fileUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

DriverDocumentSchema.index({ driverId: 1 });
DriverDocumentSchema.index({ documentType: 1 });

module.exports = mongoose.model('DriverDocument', DriverDocumentSchema);
