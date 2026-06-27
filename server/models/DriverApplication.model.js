const mongoose = require('mongoose');

const DriverApplicationSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true },
  status: { 
    type: String, 
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DOCS_REQUESTED', 'SUSPENDED'], 
    default: 'PENDING_APPROVAL' 
  },
  comments: { type: String },
  rejectionReason: { type: String },
  documentRequestComments: { type: String },
  history: [
    {
      status: { type: String, required: true },
      comments: { type: String },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

DriverApplicationSchema.index({ driverId: 1 });
DriverApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('DriverApplication', DriverApplicationSchema);
