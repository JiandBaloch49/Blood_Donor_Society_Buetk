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
  }
}, { timestamps: true });

donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ lastDonated: 1 });
donorSchema.index({ phone: 1 });

module.exports = mongoose.model('Donor', donorSchema);
