const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required']
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'bdt',
      uppercase: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      lowercase: true
    },
    stripeSessionId: {
      type: String,
      index: true
    },
    stripePaymentIntentId: {
      type: String,
      index: true
    },
    receiptUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ userEmail: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
