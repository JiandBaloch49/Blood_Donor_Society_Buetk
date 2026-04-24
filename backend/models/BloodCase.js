const mongoose = require('mongoose');

const bloodCaseSchema = new mongoose.Schema({
  // ── Patient Information ─────────────────────────────────────────────────────
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientAge: {
    type: Number,
    min: 0,
    max: 120
  },
  bloodGroupRequired: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  hbLevel: {
    type: Number,
    min: 0,
    max: 25
  },
  unitsRequired: {
    type: String,
    trim: true   // e.g. "500ml", "1 bag", "2 units"
  },
  time: {
    type: String,
    trim: true   // e.g. "14:30", "ASAP"
  },
  date: {
    type: Date,
    required: true
  },
  hospital: {
    type: String,
    trim: true
  },
  pickAndDrop: {
    type: Boolean,
    default: false
  },
  exchangePossible: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String,
    trim: true   // e.g. "Operation", "Thalassemia", "Road Accident"
  },

  // ── Attendant Information ───────────────────────────────────────────────────
  attendantName: {
    type: String,
    trim: true
  },
  attendantPhone: {
    type: String,
    trim: true
  },
  attendantResidence: {
    type: String,
    trim: true
  },

  // ── Donor Linkage (denormalized for speed + snapshot integrity) ─────────────
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  },
  donorName: {
    type: String,
    trim: true
  },
  donorPhone: {
    type: String,
    trim: true
  },

  // ── Meta ────────────────────────────────────────────────────────────────────
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

// Indexes for common query patterns
bloodCaseSchema.index({ bloodGroupRequired: 1 });
bloodCaseSchema.index({ donorId: 1 });
bloodCaseSchema.index({ date: -1 });
bloodCaseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BloodCase', bloodCaseSchema);
