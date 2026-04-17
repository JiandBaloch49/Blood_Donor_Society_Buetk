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
    enum: ['pending', 'verified', 'fulfilled'],
    default: 'pending'
  }
}, { timestamps: true });

requestSchema.index({ status: 1 });
requestSchema.index({ bloodGroup: 1 });

module.exports = mongoose.model('Request', requestSchema);
