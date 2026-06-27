const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['plough', 'rotavator', 'seeder', 'sprayer', 'trailer', 'harvester', 'cultivator'],
    required: true 
  },
  brand: { type: String },
  status: { type: String, enum: ['available', 'in_use', 'maintenance', 'inactive'], default: 'available' },
  currentTractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor' },
  compatibleWith: [{ type: String }],
  purchaseDate: { type: Date },
  lastServiceDate: { type: Date },
  photo: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

AttachmentSchema.index({ status: 1 });
AttachmentSchema.index({ type: 1 });

module.exports = mongoose.model('Attachment', AttachmentSchema);
