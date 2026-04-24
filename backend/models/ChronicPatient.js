const mongoose = require('mongoose');

const chronicPatientSchema = new mongoose.Schema({
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
    trim: true
  },
  attendantPhone: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    trim: true,
    default: 'Thalassemia'
    // e.g. 'Thalassemia', 'Hemophilia', 'Chronic Anemia', 'Sickle Cell'
  },
  transfusionIntervalDays: {
    type: Number,
    required: true,
    min: 1,
    default: 21  // Typical thalassemia interval (3 weeks)
  },
  lastTransfusionDate: {
    type: Date
  },
  nextRequiredDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-calculate nextRequiredDate before saving
chronicPatientSchema.pre('save', function (next) {
  if (this.lastTransfusionDate && this.transfusionIntervalDays) {
    const next_date = new Date(this.lastTransfusionDate);
    next_date.setDate(next_date.getDate() + this.transfusionIntervalDays);
    this.nextRequiredDate = next_date;
  }
  next();
});

chronicPatientSchema.index({ nextRequiredDate: 1 });
chronicPatientSchema.index({ bloodGroup: 1 });

module.exports = mongoose.model('ChronicPatient', chronicPatientSchema);
