const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const Driver = require('../models/Driver.model');
const DriverDocument = require('../models/DriverDocument.model');
const DriverApplication = require('../models/DriverApplication.model');
const DriverBankDetails = require('../models/DriverBankDetails.model');
const driverController = require('../controllers/driver.controller');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrifleet';

// Promise wrapper to wait for wrapped controller executions
const runController = (controllerFn, req) => {
  return new Promise((resolve, reject) => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      resolve(res);
      return res;
    };
    
    const next = (err) => {
      if (err) reject(err);
      else resolve(res);
    };

    controllerFn(req, res, next);
  });
};

const runTests = async () => {
  console.log('--- STARTING AUTOMATED DRIVER ONBOARDING TESTS ---');
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Clean previous test data
    const testEmails = ['test_driver1@agrifleet.com', 'test_driver2@agrifleet.com', 'test_driver3@agrifleet.com'];
    const testUsers = await User.find({ email: { $in: testEmails } });
    const testUserIds = testUsers.map(u => u._id);
    
    await Driver.deleteMany({ userId: { $in: testUserIds } });
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('Cleaned previous test users & profiles.');

    // 2. Test Registration & Model Linkage
    console.log('\n--- Test Case 1: Driver Profile Creation & Linkages ---');
    const user1 = await User.create({
      name: 'Test Driver One',
      email: 'test_driver1@agrifleet.com',
      password: 'Password123!',
      role: 'driver',
      phone: '9000000001'
    });

    const driver1 = await Driver.create({
      userId: user1._id,
      phone: '9000000001',
      licenseNumber: 'DL-TEST-0001',
      licenseExpiry: new Date('2030-01-01'),
      dob: new Date('1995-05-15'),
      gender: 'male',
      address: {
        village: 'Test Village',
        taluk: 'Test Taluk',
        district: 'Test District',
        state: 'Karnataka',
        pincode: '560001',
        fullAddress: '123 Test Street'
      },
      experienceYears: 5,
      tractorExperienceYears: 3,
      approvalStatus: 'PENDING_APPROVAL'
    });

    const bank1 = await DriverBankDetails.create({
      driverId: driver1._id,
      accountHolderName: 'Test Driver One',
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      ifscCode: 'TEST0001234'
    });

    console.log('Driver user created successfully.');
    console.log('Driver profile linked successfully (userId exists).');
    console.log('Bank details linked successfully.');
    console.assert(driver1.approvalStatus === 'PENDING_APPROVAL', 'Should default to PENDING_APPROVAL');

    // 3. Test ID Generation Sequence
    console.log('\n--- Test Case 2: Driver ID Generation Sequence ---');
    const adminUser = await User.findOne({ role: 'admin' });
    const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
    const reqMock = { 
      user: { _id: adminId },
      params: { id: driver1._id }
    };
    
    const currentYear = new Date().getFullYear();
    console.log(`Current Year for ID generation: ${currentYear}`);

    // Call approve driver controller
    const resMock = await runController(driverController.approveDriverApplication, reqMock);
    console.log('Approve response status:', resMock.statusCode);
    console.log('Approve response body message:', resMock.body?.message);
    
    const approvedDriver1 = await Driver.findById(driver1._id);
    console.log(`Generated ID for Driver 1: ${approvedDriver1.driverId}`);
    console.assert(approvedDriver1.driverId && approvedDriver1.driverId.startsWith(`DRV-${currentYear}-`), 'ID prefix is incorrect');
    console.assert(approvedDriver1.approvalStatus === 'APPROVED', 'Status should be APPROVED');

    // Create a second driver and approve to test incrementing
    const user2 = await User.create({
      name: 'Test Driver Two',
      email: 'test_driver2@agrifleet.com',
      password: 'Password123!',
      role: 'driver',
      phone: '9000000002'
    });

    const driver2 = await Driver.create({
      userId: user2._id,
      phone: '9000000002',
      licenseNumber: 'DL-TEST-0002',
      licenseExpiry: new Date('2031-01-01'),
      approvalStatus: 'PENDING_APPROVAL'
    });

    const reqMock2 = {
      user: { _id: adminId },
      params: { id: driver2._id }
    };
    
    const resMock2 = await runController(driverController.approveDriverApplication, reqMock2);
    console.log('Approve response 2 status:', resMock2.statusCode);
    
    const approvedDriver2 = await Driver.findById(driver2._id);
    console.log(`Generated ID for Driver 2: ${approvedDriver2.driverId}`);
    
    // Check if the numbers incremented correctly
    const num1 = parseInt(approvedDriver1.driverId.split('-')[2], 10);
    const num2 = parseInt(approvedDriver2.driverId.split('-')[2], 10);
    console.log(`Sequence verification: ${num1} -> ${num2}`);
    console.assert(num2 === num1 + 1, 'Driver ID sequence did not increment correctly');

    // 4. Test Operational Gate Protection
    console.log('\n--- Test Case 3: Operational Gate Protection (Pending/Unapproved accounts) ---');
    
    // Create an unapproved driver
    const user3 = await User.create({
      name: 'Test Driver Three',
      email: 'test_driver3@agrifleet.com',
      password: 'Password123!',
      role: 'driver',
      phone: '9000000003'
    });
    const driver3 = await Driver.create({
      userId: user3._id,
      phone: '9000000003',
      licenseNumber: 'DL-TEST-0003',
      approvalStatus: 'PENDING_APPROVAL'
    });

    // Mock request from the unapproved driver to get jobs
    const driverReqMock = { user: user3 };
    
    const driverResMock = await runController(driverController.getMyJobs, driverReqMock);
    console.log(`Status Code returned for unapproved driver jobs request: ${driverResMock.statusCode}`);
    console.log(`Response body message: ${driverResMock.body?.message}`);
    console.assert(driverResMock.statusCode === 403, 'Should return 403 Forbidden for pending drivers');
    console.log('Operational actions correctly blocked for PENDING_APPROVAL accounts.');

    // 5. Cleanup test data
    const allEmails = [...testEmails];
    const cleanupUsers = await User.find({ email: { $in: allEmails } });
    const cleanupUserIds = cleanupUsers.map(u => u._id);
    
    await Driver.deleteMany({ userId: { $in: cleanupUserIds } });
    await DriverBankDetails.deleteMany({ driverId: { $in: [driver1._id, driver2._id, driver3._id] } });
    await DriverDocument.deleteMany({ driverId: { $in: [driver1._id, driver2._id, driver3._id] } });
    await DriverApplication.deleteMany({ driverId: { $in: [driver1._id, driver2._id, driver3._id] } });
    await User.deleteMany({ email: { $in: allEmails } });

    console.log('\nAll test cases verified successfully! Cleaned database.');
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed with error:', error);
    process.exit(1);
  }
};

runTests();
