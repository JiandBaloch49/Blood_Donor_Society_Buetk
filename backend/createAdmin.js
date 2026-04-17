const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blood_donor_platform';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Admin Creation...');

    // Delete any broken manual attempts
    await Admin.deleteMany({ email: 'admin@buetk.edu.pk' });

    const newAdmin = new Admin({
      email: 'admin@buetk.edu.pk',
      password: 'adminbuetk', // This gets safely hashed automatically by the Admin model
      role: 'MASTER_ADMIN'
    });

    await newAdmin.save();
    console.log('=================================');
    console.log('✅ Success! Admin created properly.');
    console.log('Email: admin@buetk.edu.pk');
    console.log('Password: adminbuetk');
    console.log('=================================');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

createAdmin();
