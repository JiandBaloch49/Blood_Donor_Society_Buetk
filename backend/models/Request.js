const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  hospital: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  attendantPhone: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    // Phase 3: added 'expired' to the enum
    enum: ['pending', 'verified', 'fulfilled', 'expired'],
    default: 'pending'
  }
}, { timestamps: true });

requestSchema.index({ status: 1 });
requestSchema.index({ bloodGroup: 1 });
requestSchema.index({ createdAt: 1 }); // For efficient expiry queries

module.exports = mongoose.model('Request', requestSchema);
