const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{11}$/
  },
  role: {
    type: String,
    trim: true,
    default: 'Volunteer'
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

memberSchema.index({ phone: 1 });
memberSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Member', memberSchema);
