const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  userType: {
    type: String,
    required: true,
    enum: ['student', 'resident']
  },
  rollNumber: {
    type: String,
    sparse: true, // Only for students
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastDonated: {
    type: Date
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  totalDonations: {
    type: Number,
    default: 0,
    min: 0
  },

  // ── Phase 2: Reliability Scoring ─────────────────────────────────────────────
  successfulDonations: {
    type: Number,
    default: 0,
    min: 0
  },
  totalResponses: {
    type: Number,
    default: 0,
    min: 0
  },
  cancellations: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// ── Virtual: reliabilityBadge ────────────────────────────────────────────────
donorSchema.virtual('reliabilityBadge').get(function () {
  if (this.cancellations > 2) return '⚠️ Low Response';
  if (this.successfulDonations >= 2) return '⭐ Reliable';
  return 'New/Neutral';
});

// Ensure virtuals are included when serialized
donorSchema.set('toJSON', { virtuals: true });
donorSchema.set('toObject', { virtuals: true });

donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ lastDonated: 1 });
donorSchema.index({ phone: 1 });

module.exports = mongoose.model('Donor', donorSchema);
