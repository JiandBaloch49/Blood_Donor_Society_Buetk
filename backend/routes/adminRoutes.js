const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Member = require('../models/Member');
const { auth, checkRole } = require('../middleware/auth');

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      admin: { id: admin.id, role: admin.role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '12h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: admin.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/all
// @desc    Get all admins
// @access  Private (Master Admin)
router.get('/all', auth, checkRole('MASTER_ADMIN'), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/admin/create
// @desc    Create a new admin
// @access  Private (Master Admin)
router.post('/create', auth, checkRole('MASTER_ADMIN'), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const newAdmin = new Admin({ email, password, role: role || 'ADMIN' });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully', admin: { _id: newAdmin._id, email: newAdmin.email, role: newAdmin.role, createdAt: newAdmin.createdAt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server Error: ${err.message}` });
  }
});

// @route   DELETE /api/admin/:id
// @desc    Delete an admin
// @access  Private (Master Admin)
router.delete('/:id', auth, checkRole('MASTER_ADMIN'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (admin._id.toString() === req.admin.id) {
       return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/donors
// @desc    Get all donors
// @access  Private (Admin)
router.get('/donors', auth, async (req, res) => {
  try {
    let donors = await Donor.find().lean().sort({ createdAt: -1 });
    
    const today = new Date();
    donors = donors.map(donor => {
      if (donor.lastDonated) {
        const diffTime = today - new Date(donor.lastDonated);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 60) {
          donor.isAvailable = false;
        }
      }
      return donor;
    });

    res.json(donors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/admin/donors
// @desc    Create a new donor
// @access  Private (Admin)
router.post('/donors', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, bloodGroup, userType, rollNumber, address } = req.body;
    const phoneRegex = /^[0-9]{11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 11 digits' });
    }

    const newDonor = new Donor({
      firstName, lastName, phone, bloodGroup, userType, rollNumber, address, isVerified: true
    }); 
    const donor = await newDonor.save();
    res.status(201).json(donor);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/admin/donors/:id
// @desc    Update donor
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

    donor = await Donor.findByIdAndUpdate(req.params.id, { $set: donorFields }, { new: true });
    res.json(donor);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/admin/donors/:id
// @desc    Delete donor
// @access  Private (Admin)
router.delete('/donors/:id', auth, async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donor removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
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
    res.status(500).json({ message: 'Server Error' });
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

    request = await Request.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/admin/requests/:id
// @desc    Delete request
// @access  Private (Admin)
router.delete('/requests/:id', auth, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/members
// @desc    Get all society members (admin view)
// @access  Private (Admin/Master)
router.get('/members', auth, async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/admin/members
// @desc    Add a new society member
// @access  Private (Admin/Master)
router.post('/members', auth, async (req, res) => {
  try {
    const { name, phone, role, isAvailable } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    
    // Check dupe phone
    const existing = await Member.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'A member with this phone number already exists' });
    }

    const newMember = new Member({
      name, phone, role, isAvailable
    });
    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/admin/members/:id
// @desc    Delete a society member
// @access  Private (Admin/Master)
router.delete('/members/:id', auth, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
