const mongoose = require('mongoose');

const DriverBankDetailsSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, unique: true },
  accountHolderName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  upiId: { type: String }, // Optional
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

DriverBankDetailsSchema.index({ driverId: 1 });

module.exports = mongoose.model('DriverBankDetails', DriverBankDetailsSchema);
