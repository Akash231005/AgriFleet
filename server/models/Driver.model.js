const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  phone: { type: String },
  name: { type: String },
  mobile: { type: String, unique: true, sparse: true },
  password: { type: String },
  isOnline: { type: Boolean, default: false },
  licenseNumber: { type: String, unique: true, sparse: true },
  licenseExpiry: { type: Date },
  profilePhoto: { type: String },
  status: { type: String, enum: ['available', 'on_job', 'off_duty', 'inactive'], default: 'available' },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [77.5946, 12.9716] }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalJobsDone: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },

  // --- Extended Onboarding Details ---
  dob: { type: Date },
  gender: { type: String },
  emergencyContact: { type: String },

  address: {
    village: { type: String },
    taluk: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    fullAddress: { type: String }
  },

  experienceYears: { type: Number, default: 0 },
  tractorExperienceYears: { type: Number, default: 0 },
  otherMachinery: { type: String },
  languages: { type: [String], default: [] },
  preferredDistricts: { type: [String], default: [] },

  driverId: { type: String, unique: true, sparse: true }, // sparse because it's only generated on approval
  profileStatus: { type: String, enum: ['INCOMPLETE', 'COMPLETE'], default: 'INCOMPLETE' },
  verificationStatus: { type: String, enum: ['PENDING_DOCUMENTS', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'], default: 'PENDING_DOCUMENTS' },
  isApproved: { type: Boolean, default: false },
  approvalStatus: {
    type: String,
    enum: ['INCOMPLETE', 'PENDING_DOCUMENTS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING_APPROVAL'],
    default: 'INCOMPLETE'
  },
  rejectionReason: { type: String },
  rejectionHistory: [
    {
      reason: { type: String },
      rejectedAt: { type: Date, default: Date.now }
    }
  ],
  documentRequestComments: { type: String }
});

DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

DriverSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

DriverSchema.index({ status: 1 });
DriverSchema.index({ approvalStatus: 1 });
DriverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);
