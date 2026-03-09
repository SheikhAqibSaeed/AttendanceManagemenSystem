require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ams';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const exists = await Employee.findOne({ role: 'admin' });
    if (exists) {
      console.log('Admin already exists:', exists.email);
      process.exit(0);
      return;
    }
    const admin = await Employee.create({
      employeeId: 'ADMIN001',
      userName: 'Admin User',
      email: 'admin@ams.com',
      phone: '03000000001',
      monthlySalary: 0,
      role: 'admin',
      password: 'admin123',
    });
    console.log('Admin created:', admin.email, '| Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
