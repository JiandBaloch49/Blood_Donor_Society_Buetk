const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blood_donor_platform';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected for Seeding...');

    const existingAdmin = await Admin.findOne({ username: 'JIAND_BALOCH' });
    if (existingAdmin) {
      console.log('Admin already exists. Skipping seed.');
      process.exit(0);
    }

    const newAdmin = new Admin({
      username: 'JIAND_BALOCH',
      email: 'admin@buetk.edu.pk',
      password: 'password123' // Will be hashed automatically by pre-save hook
    });

    await newAdmin.save();
    console.log('=================================');
    console.log('Seed Success! Initial Admin created:');
    console.log('Username: JIAND_BALOCH');
    console.log('Password: password123');
    console.log('=================================');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
