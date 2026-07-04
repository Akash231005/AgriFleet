const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User.model');
const Driver = require('./models/Driver.model');
const Tractor = require('./models/Tractor.model');
const Attachment = require('./models/Attachment.model');
const Booking = require('./models/Booking.model');
const Farmer = require('./models/Farmer.model');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI environment variable is missing.');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clean Database
    await User.deleteMany();
    await Driver.deleteMany();
    await Tractor.deleteMany();
    await Attachment.deleteMany();
    await Booking.deleteMany();
    await Farmer.deleteMany();
    console.log('Database cleaned.');

    // 2. Create Admin Account
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@agrifleet.com',
      password: 'Password123', // Will be hashed by pre-save hook
      role: 'admin',
      phone: '9999999999'
    });
    console.log('Admin account created.');

    // 3. Create Drivers
    const driver1User = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@agrifleet.com',
      password: 'Password123',
      role: 'driver',
      phone: '9876543210'
    });
    const driver1 = await Driver.create({
      userId: driver1User._id,
      phone: '9876543210',
      licenseNumber: 'DL-IND-0001',
      licenseExpiry: new Date('2030-12-31'),
      status: 'available',
      rating: 4.8,
      totalJobsDone: 12,
      totalEarnings: 8400
    });

    const driver2User = await User.create({
      name: 'Suresh Patel',
      email: 'suresh@agrifleet.com',
      password: 'Password123',
      role: 'driver',
      phone: '9876543211'
    });
    const driver2 = await Driver.create({
      userId: driver2User._id,
      phone: '9876543211',
      licenseNumber: 'DL-IND-0002',
      licenseExpiry: new Date('2029-06-30'),
      status: 'available',
      rating: 4.5,
      totalJobsDone: 8,
      totalEarnings: 5100
    });

    const driver3User = await User.create({
      name: 'Manpreet Singh',
      email: 'manpreet@agrifleet.com',
      password: 'Password123',
      role: 'driver',
      phone: '9876543212'
    });
    const driver3 = await Driver.create({
      userId: driver3User._id,
      phone: '9876543212',
      licenseNumber: 'DL-IND-0003',
      licenseExpiry: new Date('2031-03-15'),
      status: 'available',
      rating: 4.9,
      totalJobsDone: 24,
      totalEarnings: 18600
    });

    console.log('Drivers seeded successfully.');

    // 4. Create Tractors
    const tractors = await Tractor.create([
      {
        registrationNo: 'KA-51-TR-1001',
        model: 'John Deere 5050D',
        brand: 'John Deere',
        year: 2022,
        horsePower: 50,
        fuelType: 'diesel',
        status: 'available',
        fuelLevel: 90,
        totalHoursRun: 420,
        photo: 'https://images.unsplash.com/photo-1594913785162-e67853f23cb7?auto=format&fit=crop&q=80&w=600'
      },
      {
        registrationNo: 'KA-51-TR-1002',
        model: 'Mahindra Arjun Novo 605',
        brand: 'Mahindra',
        year: 2023,
        horsePower: 57,
        fuelType: 'diesel',
        status: 'available',
        fuelLevel: 85,
        totalHoursRun: 180,
        photo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600'
      },
      {
        registrationNo: 'KA-51-TR-1003',
        model: 'Sonalika Tiger DI 75',
        brand: 'Sonalika',
        year: 2024,
        horsePower: 75,
        fuelType: 'diesel',
        status: 'available',
        fuelLevel: 95,
        totalHoursRun: 50,
        photo: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600'
      }
    ]);
    console.log('Tractors seeded successfully.');

    // 5. Create Attachments
    await Attachment.create([
      {
        name: 'Heavy Duty Disc Plough',
        type: 'plough',
        brand: 'John Deere',
        status: 'available',
        compatibleWith: ['John Deere', 'Mahindra']
      },
      {
        name: 'Multi-Speed Rotavator',
        type: 'rotavator',
        brand: 'Mahindra',
        status: 'available',
        compatibleWith: ['Mahindra', 'Sonalika']
      },
      {
        name: 'Pneumatic Seed Planter',
        type: 'seeder',
        brand: 'Sonalika',
        status: 'available',
        compatibleWith: ['John Deere', 'Sonalika']
      },
      {
        name: 'Boom Crop Sprayer',
        type: 'sprayer',
        brand: 'Generic',
        status: 'available',
        compatibleWith: ['John Deere', 'Mahindra', 'Sonalika']
      },
      {
        name: 'Hydraulic Tipping Trailer',
        type: 'trailer',
        brand: 'Generic',
        status: 'available',
        compatibleWith: ['John Deere', 'Mahindra', 'Sonalika']
      },
      {
        name: 'Combine Harvester Head',
        type: 'harvester',
        brand: 'Class',
        status: 'available',
        compatibleWith: ['John Deere']
      }
    ]);
    console.log('Attachments seeded successfully.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
