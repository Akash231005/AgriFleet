const mongoose = require('mongoose');
const User = require('./models/User.model');
const Driver = require('./models/Driver.model');
const Farmer = require('./models/Farmer.model');
const Booking = require('./models/Booking.model');
const JobRequest = require('./models/JobRequest.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrifleet';

const seedDriverData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for driver module seeding...');

    // 1. Clean previous test runs
    await User.deleteMany({ email: { $in: ['farmer_test@agrifleet.com', 'ramesh@agrifleet.com'] } });
    await Driver.deleteMany({ mobile: '9876543210' });
    await Farmer.deleteMany({ phone: '9876543215' });
    await Booking.deleteMany({ bookingRef: { $in: ['AF-2026-9001', 'AF-2026-9002', 'AF-2026-9003'] } });
    await JobRequest.deleteMany({});
    console.log('Cleaned driver module test records.');

    // 2. Create Farmer User
    const farmerUser = await User.create({
      name: 'Sardar Manpreet Singh',
      email: 'farmer_test@agrifleet.com',
      password: 'Password123',
      role: 'farmer',
      phone: '9876543215'
    });

    const farmer = await Farmer.create({
      userId: farmerUser._id,
      phone: '9876543215',
      village: 'Sherpur',
      district: 'Patiala',
      state: 'Punjab',
      pincode: '147001',
      totalAcres: 15,
      landType: 'irrigated',
      isVerified: true
    });
    console.log('Seeded test Farmer.');

    // 3. Create Driver User & profile
    const driverUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@agrifleet.com',
      password: 'Password123',
      role: 'driver',
      phone: '9876543210'
    });

    const driver = await Driver.create({
      userId: driverUser._id,
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      password: 'Password123',
      phone: '9876543210',
      licenseNumber: 'DL-PUNJAB-901',
      licenseExpiry: new Date('2032-12-31'),
      status: 'available',
      rating: 4.8,
      totalJobsDone: 10,
      totalEarnings: 15000,
      isOnline: true,
      approvalStatus: 'APPROVED',
      address: {
        village: 'Sherpur',
        taluk: 'Patiala',
        district: 'Patiala',
        state: 'Punjab',
        pincode: '147001',
        fullAddress: 'Sherpur Road, Patiala, Punjab'
      }
    });
    console.log('Seeded test Driver Ramesh Kumar (APPROVED, ONLINE, district: Patiala).');

    // 4. Create pending Bookings in Patiala district (insert via native collection to bypass Mongoose pre-save hook)
    await Booking.collection.insertMany([
      {
        bookingRef: 'AF-2026-9001',
        farmerId: farmer._id,
        driverId: driver._id,
        workType: 'ploughing',
        areaAcres: 5.5,
        fieldLocation: {
          address: 'Main Farm Rd, Sherpur',
          village: 'Sherpur',
          coordinates: [76.38, 30.33]
        },
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        timeSlot: 'morning',
        estimatedCost: 3500,
        status: 'assigned',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bookingRef: 'AF-2026-9002',
        farmerId: farmer._id,
        workType: 'rotavating',
        areaAcres: 8.0,
        fieldLocation: {
          address: 'West Fields, Sherpur',
          village: 'Sherpur',
          coordinates: [76.39, 30.34]
        },
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // day after tomorrow
        timeSlot: 'afternoon',
        estimatedCost: 6400,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Seeded 2 pending local bookings in Patiala.');

    console.log('Driver module seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDriverData();
