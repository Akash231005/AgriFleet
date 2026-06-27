const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'cash', 'wallet'], default: 'card' },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  paidAt: { type: Date },
  refundedAt: { type: Date },
  refundAmount: { type: Number },
  invoiceUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ farmerId: 1, status: 1 });
PaymentSchema.index({ paidAt: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
