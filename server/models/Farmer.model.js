const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: { type: String, required: true },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  pincode: { type: String },
  totalAcres: { type: Number },
  landType: { type: String, enum: ['irrigated', 'rainfed', 'dryland'], default: 'rainfed' },
  profilePhoto: { type: String },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

FarmerSchema.index({ userId: 1 });
FarmerSchema.index({ district: 1 });

module.exports = mongoose.model('Farmer', FarmerSchema);
