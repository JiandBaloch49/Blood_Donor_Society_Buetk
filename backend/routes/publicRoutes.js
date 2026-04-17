const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Member = require('../models/Member');

// @route   GET /api/public/members
// @desc    Get all available society members
// @access  Public
router.get('/members', async (req, res) => {
  try {
    const members = await Member.find({ isAvailable: true }).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/public/donors
// @desc    Submit a new donor registration
// @access  Public
router.post('/donors', async (req, res) => {
  try {
    const { firstName, lastName, phone, bloodGroup, userType, rollNumber, address } = req.body;
    
    if (!firstName || !lastName || !phone || !bloodGroup || !userType || !address) {
       return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const phoneRegex = /^[0-9]{11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 11 digits' });
    }

    // Optional: check if phone already exists as donor
    const existingDonor = await Donor.findOne({ phone });
    if (existingDonor) {
      return res.status(400).json({ message: 'A donor with this phone number is already registered' });
    }

    const newDonor = new Donor({
      firstName, lastName, phone, bloodGroup, userType, rollNumber, address
    });

    const donor = await newDonor.save();
    res.status(201).json({ message: 'Donor registered successfully. Pending admin verification.', donor });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/public/requests
// @desc    Submit a new emergency blood request
// @access  Public
router.post('/requests', async (req, res) => {
  try {
    const { patientName, bloodGroup, hospital, urgency, attendantPhone } = req.body;

    if (!patientName || !bloodGroup || !hospital || !attendantPhone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const phoneRegex = /^[0-9]{11}$/;
    if (!phoneRegex.test(attendantPhone)) {
      return res.status(400).json({ message: 'Attendant phone number must be exactly 11 digits' });
    }

    const newRequest = new Request({
      patientName, bloodGroup, hospital, urgency, attendantPhone
    });

    const request = await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully. Admin will review shortly.', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
