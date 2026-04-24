const express = require('express');
const router = express.Router();
const ChronicPatient = require('../models/ChronicPatient');
const { auth } = require('../middleware/auth');

// @route   GET /api/chronic
// @desc    Get all chronic patients sorted by nextRequiredDate ASC
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    const patients = await ChronicPatient.find({ isActive: true })
      .sort({ nextRequiredDate: 1 }) // Most urgent first
      .lean();

    // Attach urgency hint: days until next transfusion
    const today = new Date();
    const enriched = patients.map(p => {
      const daysUntil = p.nextRequiredDate
        ? Math.ceil((new Date(p.nextRequiredDate) - today) / (1000 * 60 * 60 * 24))
        : null;
      return { ...p, daysUntilNext: daysUntil };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/chronic
// @desc    Add a new chronic patient
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  try {
    const {
      patientName, bloodGroup, hospital, attendantPhone,
      condition, transfusionIntervalDays, lastTransfusionDate, notes
    } = req.body;

    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ message: 'Patient name is required' });
    }
    if (!bloodGroup) {
      return res.status(400).json({ message: 'Blood group is required' });
    }
    if (!transfusionIntervalDays || transfusionIntervalDays < 1) {
      return res.status(400).json({ message: 'Transfusion interval must be at least 1 day' });
    }
    if (attendantPhone && !/^[0-9]{11}$/.test(attendantPhone)) {
      return res.status(400).json({ message: 'Attendant phone must be exactly 11 digits' });
    }

    const patient = new ChronicPatient({
      patientName: patientName.trim(),
      bloodGroup,
      hospital,
      attendantPhone,
      condition: condition || 'Thalassemia',
      transfusionIntervalDays: Number(transfusionIntervalDays),
      lastTransfusionDate: lastTransfusionDate ? new Date(lastTransfusionDate) : undefined,
      notes
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/chronic/:id/transfusion
// @desc    Log a transfusion — updates lastTransfusionDate to today, recalculates next
// @access  Private (Admin)
router.put('/:id/transfusion', auth, async (req, res) => {
  try {
    const patient = await ChronicPatient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.lastTransfusionDate = new Date();
    // nextRequiredDate is recalculated by the pre-save hook
    await patient.save();

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/chronic/:id
// @desc    Update a chronic patient record
// @access  Private (Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      patientName, bloodGroup, hospital, attendantPhone,
      condition, transfusionIntervalDays, lastTransfusionDate, notes, isActive
    } = req.body;

    const patient = await ChronicPatient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (attendantPhone && !/^[0-9]{11}$/.test(attendantPhone)) {
      return res.status(400).json({ message: 'Attendant phone must be exactly 11 digits' });
    }

    if (patientName !== undefined) patient.patientName = patientName.trim();
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (hospital !== undefined) patient.hospital = hospital;
    if (attendantPhone !== undefined) patient.attendantPhone = attendantPhone;
    if (condition !== undefined) patient.condition = condition;
    if (transfusionIntervalDays !== undefined) patient.transfusionIntervalDays = Number(transfusionIntervalDays);
    if (lastTransfusionDate !== undefined) patient.lastTransfusionDate = new Date(lastTransfusionDate);
    if (notes !== undefined) patient.notes = notes;
    if (isActive !== undefined) patient.isActive = isActive;

    await patient.save(); // triggers pre-save hook for nextRequiredDate

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/chronic/:id
// @desc    Remove a chronic patient (soft-delete via isActive = false or hard delete)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await ChronicPatient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
