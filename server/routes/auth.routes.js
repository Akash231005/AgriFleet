const express = require('express');
const router = express.Router();
const { registerFarmer, registerDriver, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerFarmer);
router.post('/register-driver', registerDriver);
router.post('/login', login);
router.get('/me', protect, getMe);

// DEMO REPAIR ENDPOINT
router.post('/repair-demo', async (req, res) => {
    try {
        const User = require('../models/User.model');
        const Driver = require('../models/Driver.model');

        // Check missing Admin
        const adminExists = await User.findOne({ email: 'admin_demo@agrifleet.com' });
        if (!adminExists) {
            await User.create({ name: 'Demo Admin', email: 'admin_demo@agrifleet.com', password: 'Password123!', role: 'admin', phone: '1010101010', isActive: true });
        }

        const corruptedDriver = await User.findOne({ email: 'driver_demo@agrifleet.com' });
        if (corruptedDriver) {
            const driverDoc = await Driver.findOne({ userId: corruptedDriver._id });
            if (driverDoc) {
                await require('../models/DriverBankDetails.model').deleteMany({ driverId: driverDoc._id });
                await require('../models/DriverApplication.model').deleteMany({ driverId: driverDoc._id });
                await Driver.deleteMany({ userId: corruptedDriver._id });
            }
            await User.deleteOne({ _id: corruptedDriver._id });
        }

        const ts = Date.now().toString().slice(-10);
        const newDriverUser = await User.create({
            name: 'Demo Driver', email: 'driver_demo@agrifleet.com', password: 'Password123!', role: 'driver', phone: ts, isActive: true
        });

        await Driver.create({
            userId: newDriverUser._id, phone: ts, gender: 'Male', experienceYears: 5, profileStatus: 'COMPLETE', verificationStatus: 'VERIFIED', isApproved: true, approvalStatus: 'approved'
        });

        res.json({ success: true, message: 'Repaired seamlessly.' });
    } catch (e) {
        res.json({ success: false, message: e.message, stack: e.stack });
    }
});

module.exports = router;

