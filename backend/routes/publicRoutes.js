const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Request = require('../models/Request');

// @route   POST /api/public/donors
// @desc    Submit a new donor registration
// @access  Public
router.post('/donors', async (req, res) => {
  try {
    const { firstName, lastName, phone, bloodGroup, userType, rollNumber, address } = req.body;
    
    // Create new donor (isVerified is false by default, isAvailable is true)
    const newDonor = new Donor({
      firstName,
      lastName,
      phone,
      bloodGroup,
      userType,
      rollNumber,
      address
    });

    const donor = await newDonor.save();
    res.status(201).json({ message: 'Donor registered successfully. Pending admin verification.', donor });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/public/requests
// @desc    Submit a new emergency blood request
// @access  Public
router.post('/requests', async (req, res) => {
  try {
    const { patientName, bloodGroup, hospital, urgency, attendantPhone } = req.body;

    const newRequest = new Request({
      patientName,
      bloodGroup,
      hospital,
      urgency,
      attendantPhone
    });

    const request = await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully. Admin will review shortly.', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
