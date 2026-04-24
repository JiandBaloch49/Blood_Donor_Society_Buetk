const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Member = require('../models/Member');
const BloodCase = require('../models/BloodCase');
const { auth, checkRole } = require('../middleware/auth');

// ─── Priority Calculation Helper ─────────────────────────────────────────────
/**
 * Given an array of lean donor objects, computes `status` and `priorityRank`
 * for each. Available donors are ranked 1,2,3... by:
 *   1. Oldest lastDonated first (never donated = highest priority)
 *   2. Fewest totalDonations as tie-breaker
 * Resting donors get status "Resting" and priorityRank null.
 */
const computePriority = (donors) => {
  const today = new Date();
  const COOLDOWN_DAYS = 60;

  donors.forEach(donor => {
    if (!donor.lastDonated) {
      donor.status = 'Available';
    } else {
      const diffDays = Math.floor((today - new Date(donor.lastDonated)) / (1000 * 60 * 60 * 24));
      donor.status = diffDays >= COOLDOWN_DAYS ? 'Available' : 'Resting';
    }
    donor.isAvailable = donor.status === 'Available';
  });

  // Rank available donors: oldest lastDonated first, then fewest donations
  const available = donors
    .filter(d => d.status === 'Available')
    .sort((a, b) => {
      const aDate = a.lastDonated ? new Date(a.lastDonated).getTime() : 0;
      const bDate = b.lastDonated ? new Date(b.lastDonated).getTime() : 0;
      if (aDate !== bDate) return aDate - bDate; // older date = higher priority
      return (a.totalDonations || 0) - (b.totalDonations || 0); // fewer donations = higher priority
    });

  available.forEach((donor, idx) => {
    donor.priorityRank = idx + 1;
  });

  donors.filter(d => d.status === 'Resting').forEach(d => {
    d.priorityRank = null;
  });

  return donors;
};

// ─── Admin Auth ───────────────────────────────────────────────────────────────

// @route   POST /api/admin/login
// @desc    Authenticate admin & set cookie
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
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
      (err, token) => {
        if (err) throw err;
        
        res.cookie('adminToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 12 * 60 * 60 * 1000 // 12 hours
        });

        res.json({ role: admin.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/admin/logout
// @desc    Clear admin session
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.clearCookie('adminToken');
  res.json({ message: 'Logged out successfully' });
});

// ─── Admin Management ─────────────────────────────────────────────────────────

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

// ─── Donors ───────────────────────────────────────────────────────────────────

// @route   GET /api/admin/donors
// @desc    Get all donors with computed priority ranking
// @access  Private (Admin)
router.get('/donors', auth, async (req, res) => {
  try {
    // Use toObject() instead of lean() so that virtuals (reliabilityBadge) are included
    const raw = await Donor.find().sort({ createdAt: -1 });
    let donors = raw.map(d => d.toObject({ virtuals: true }));
    donors = computePriority(donors);
    res.json(donors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/donors/:id
// @desc    Get full donor profile with donation case history
// @access  Private (Admin)
router.get('/donors/:id', auth, async (req, res) => {
  try {
    const donorDoc = await Donor.findById(req.params.id);
    if (!donorDoc) return res.status(404).json({ message: 'Donor not found' });
    const donor = donorDoc.toObject({ virtuals: true });

    // Compute status & priority relative to their blood group peers
    const peerDocs = await Donor.find({ bloodGroup: donor.bloodGroup });
    const peers = peerDocs.map(d => d.toObject({ virtuals: true }));
    const rankedPeers = computePriority(peers);
    const ranked = rankedPeers.find(d => d._id.toString() === req.params.id);

    // Fetch all cases linked to this donor
    const history = await BloodCase.find({ donorId: req.params.id })
      .sort({ date: -1 })
      .lean();

    res.json({
      ...ranked,
      donationHistory: history
    });
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
    const { isVerified, lastDonated } = req.body;

    const donorFields = {};
    if (isVerified !== undefined) donorFields.isVerified = isVerified;
    
    if (lastDonated !== undefined) {
      const donationDate = new Date(lastDonated);
      if (isNaN(donationDate.getTime()) || donationDate > new Date()) {
        return res.status(400).json({ message: 'Invalid or future date not allowed for lastDonated' });
      }
      donorFields.lastDonated = lastDonated;
    }

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

// ─── Blood Cases ──────────────────────────────────────────────────────────────

// @route   POST /api/admin/cases
// @desc    Log a new blood donation case and update donor stats
// @access  Private (Admin)
router.post('/cases', auth, async (req, res) => {
  try {
    const {
      patientName, bloodGroupRequired, date,
      patientAge, hbLevel, unitsRequired, time, hospital,
      pickAndDrop, exchangePossible, purpose,
      attendantName, attendantPhone, attendantResidence,
      donorId, donorName, donorPhone
    } = req.body;

    // Required field validation
    if (!patientName || !patientName.trim()) {
      return res.status(400).json({ message: 'Patient name is required' });
    }
    if (!bloodGroupRequired) {
      return res.status(400).json({ message: 'Blood group is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Date validation — reject invalid or purely future dates
    const caseDate = new Date(date);
    if (isNaN(caseDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date provided' });
    }

    // Validate attendant phone if provided
    if (attendantPhone && attendantPhone.trim()) {
      const phoneRegex = /^[0-9]{11}$/;
      if (!phoneRegex.test(attendantPhone.trim())) {
        return res.status(400).json({ message: 'Attendant phone must be exactly 11 digits' });
      }
    }

    // Validate donor phone if provided
    if (donorPhone && donorPhone.trim()) {
      const phoneRegex = /^[0-9]{11}$/;
      if (!phoneRegex.test(donorPhone.trim())) {
        return res.status(400).json({ message: 'Donor phone must be exactly 11 digits' });
      }
    }

    // Create the case record
    const newCase = new BloodCase({
      patientName: patientName.trim(),
      patientAge,
      bloodGroupRequired,
      hbLevel,
      unitsRequired,
      time,
      date: caseDate,
      hospital,
      pickAndDrop: pickAndDrop || false,
      exchangePossible: exchangePossible || false,
      purpose,
      attendantName,
      attendantPhone,
      attendantResidence,
      donorId: donorId || undefined,
      donorName,
      donorPhone,
      createdBy: req.admin.id
    });

    await newCase.save();

    // Update donor stats atomically if a donor was assigned
    if (donorId) {
      await Donor.findByIdAndUpdate(donorId, {
        $inc: { totalDonations: 1 },
        $set: { lastDonated: caseDate }
      });
    }

    res.status(201).json(newCase);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/cases
// @desc    List all cases sorted by newest first
// @access  Private (Admin)
router.get('/cases', auth, async (req, res) => {
  try {
    const cases = await BloodCase.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(cases);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/admin/cases/:id
// @desc    Get a single case with full details
// @access  Private (Admin)
router.get('/cases/:id', auth, async (req, res) => {
  try {
    const bloodCase = await BloodCase.findById(req.params.id).lean();
    if (!bloodCase) return res.status(404).json({ message: 'Case not found' });
    res.json(bloodCase);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/admin/cases/:id
// @desc    Delete a case (admin decision is final — does not revert donor stats)
// @access  Private (Admin)
router.delete('/cases/:id', auth, async (req, res) => {
  try {
    const bloodCase = await BloodCase.findById(req.params.id);
    if (!bloodCase) return res.status(404).json({ message: 'Case not found' });
    await BloodCase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Case removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ─── Emergency Requests ───────────────────────────────────────────────────────

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

// ─── Society Members ──────────────────────────────────────────────────────────

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
    
    const existing = await Member.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'A member with this phone number already exists' });
    }

    const newMember = new Member({ name, phone, role, isAvailable });
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
