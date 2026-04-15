const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      admin: { id: admin.id }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '12h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/donors
// @desc    Get all donors
// @access  Private (Admin)
router.get('/donors', auth, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/donors/:id
// @desc    Update donor (toggle availability/verification, update lastDonated)
// @access  Private (Admin)
router.put('/donors/:id', auth, async (req, res) => {
  try {
    const { isVerified, isAvailable, lastDonated } = req.body;

    const donorFields = {};
    if (isVerified !== undefined) donorFields.isVerified = isVerified;
    if (isAvailable !== undefined) donorFields.isAvailable = isAvailable;
    if (lastDonated !== undefined) donorFields.lastDonated = lastDonated;

    let donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { $set: donorFields },
      { new: true }
    );

    res.json(donor);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/requests
// @desc    Get all emergency requests
// @access  Private (Admin)
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/requests/:id
// @desc    Verify or fulfill emergency request
// @access  Private (Admin)
router.put('/requests/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'verified', 'fulfilled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    let request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
