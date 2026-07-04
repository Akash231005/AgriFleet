const User = require('../models/User.model');
const Farmer = require('../models/Farmer.model');
const Driver = require('../models/Driver.model');
const DriverDocument = require('../models/DriverDocument.model');
const DriverApplication = require('../models/DriverApplication.model');
const DriverBankDetails = require('../models/DriverBankDetails.model');
const DriverNotification = require('../models/DriverNotification.model');
const { saveBase64File } = require('../utils/fileSaver');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/apiResponse');
const asyncWrapper = require('../utils/asyncWrapper');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// @desc    Register a new Farmer
// @route   POST /api/v1/auth/register
// @access  Public
const registerFarmer = asyncWrapper(async (req, res) => {
  const { name, email, password, phone, village, district, state, pincode, totalAcres, landType } = req.body;

  const errors = {};

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Invalid email format';
  }
  if (phone && !/^\d{10}$/.test(phone)) {
    errors.phone = 'Invalid phone format';
  }
  if (password && password.length < 8) {
    errors.password = 'Password does not meet requirements (min 8 chars)';
  }

  // Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    errors.email = 'Email address is already registered.';
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    errors.phone = 'Mobile number is already registered.';
  }

  if (Object.keys(errors).length > 0) {
    return error(res, 'Validation Error', 400, errors);
  }

  // Create base User
  const user = await User.create({
    name,
    email,
    password,
    role: 'farmer',
    phone
  });

  // Create associated Farmer record
  const farmer = await Farmer.create({
    userId: user._id,
    phone,
    village,
    district,
    state,
    pincode,
    totalAcres,
    landType
  });

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Exclude password from response user object
  user.password = undefined;

  return success(res, { user, farmer, token }, 'Registration successful.', 201);
});

// @desc    User Login
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncWrapper(async (req, res) => {
  const { email, mobile, username, password } = req.body;
  const identifier = email || mobile || username;

  if (!identifier || !password) {
    return error(res, 'Please provide email/mobile and password.', 400);
  }

  let user = null;
  const isEmail = identifier.includes('@');

  if (isEmail) {
    user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
  } else {
    // Search user by phone
    user = await User.findOne({ phone: identifier }).select('+password');

    if (!user) {
      // Check if there is a Driver with this mobile/phone (for standalone seeded drivers)
      const driver = await Driver.findOne({ $or: [{ mobile: identifier }, { phone: identifier }] });
      if (driver) {
        // Find or create User for this Driver to ensure they have a User record (Single Source of Truth)
        let driverUser = await User.findOne({ email: `${identifier}@agrifleet.com` }).select('+password');
        if (!driverUser) {
          // Check if password on Driver model matches
          const isMatch = await driver.comparePassword(password);
          if (!isMatch) {
            return error(res, 'Invalid mobile or password credentials.', 401);
          }
          driverUser = await User.create({
            name: driver.name || 'Driver',
            email: `${identifier}@agrifleet.com`,
            password: password, // Hashed by pre-save
            role: 'driver',
            phone: identifier,
            isActive: true
          });
        }
        driver.userId = driverUser._id;
        await driver.save();
        user = driverUser;
      }
    }
  }

  if (!user) {
    return error(res, 'Invalid email/mobile or password credentials.', 401);
  }

  // Verify password matches hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return error(res, 'Invalid email/mobile or password credentials.', 401);
  }

  if (!user.isActive) {
    return error(res, 'This user account is suspended or deactivated.', 403);
  }

  // Update last login date
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT
  const token = generateToken(user._id, user.role);
  user.password = undefined;

  // Populate related profiles based on user role
  let profile = null;
  if (user.role === 'farmer') {
    profile = await Farmer.findOne({ userId: user._id });
  } else if (user.role === 'driver') {
    profile = await Driver.findOne({ userId: user._id });
  }

  // Check approval status for drivers
  if (user.role === 'driver' && profile) {
    const status = (profile.approvalStatus || '').toLowerCase();
    if (status !== 'approved') {
      if (status === 'rejected') {
        return error(res, 'Your application was rejected.', 403);
      }
      return error(res, 'Your account is under review.', 403);
    }
  }

  const responseData = { user, profile, token };
  if (user.role === 'driver') {
    responseData.driver = {
      id: profile?._id,
      name: profile?.name,
      mobile: profile?.mobile || profile?.phone,
      approvalStatus: profile?.approvalStatus,
      profileStatus: profile?.profileStatus,
      verificationStatus: profile?.verificationStatus
    };
  }

  return success(res, responseData, 'Login successful.', 200);
});

// @desc    Get Current Logged In User Profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncWrapper(async (req, res) => {
  const user = req.user;

  let profile = null;
  if (user.role === 'farmer') {
    profile = await Farmer.findOne({ userId: user._id });
  } else if (user.role === 'driver') {
    profile = await Driver.findOne({ userId: user._id });
  }

  return success(res, { user, profile }, 'User details fetched successfully.', 200);
});

// @desc    Register a new Driver (Self-onboarding)
// @route   POST /api/v1/auth/register-driver
// @access  Public
const registerDriver = asyncWrapper(async (req, res) => {
  const { personalDetails, addressDetails, professionalDetails, bankDetails, documents } = req.body;

  if (!personalDetails || !personalDetails.email || !personalDetails.password) {
    return error(res, 'Please provide essential personal details.', 400);
  }

  const errors = {};

  if (personalDetails?.email && !/^\S+@\S+\.\S+$/.test(personalDetails.email)) {
    errors.email = 'Invalid email format';
  }
  if (personalDetails?.phone && !/^\d{10}$/.test(personalDetails.phone)) {
    errors.phone = 'Invalid phone format';
  }
  if (personalDetails?.password && personalDetails.password.length < 8) {
    errors.password = 'Password does not meet requirements (min 8 chars)';
  }
  if (professionalDetails?.experienceYears > 50) {
    errors.experienceYears = 'Experience exceeds allowed limit';
  }

  // Check if email already registered
  const existingUser = await User.findOne({ email: personalDetails?.email });
  if (existingUser) {
    errors.email = 'Email address is already registered.';
  }

  const existingPhone = await User.findOne({ phone: personalDetails?.phone });
  const existingMobile = await Driver.findOne({ mobile: personalDetails?.phone });
  if (existingPhone || existingMobile) {
    errors.phone = 'Mobile number already exists';
  }

  if (professionalDetails?.licenseNumber) {
    const existingLicense = await Driver.findOne({ licenseNumber: professionalDetails.licenseNumber });
    if (existingLicense) {
      errors.licenseNumber = 'License number already exists';
    }
  }

  if (Object.keys(errors).length > 0) {
    return error(res, 'Validation Error', 400, errors);
  }

  // Create base User with role 'driver'
  const user = await User.create({
    name: personalDetails.name,
    email: personalDetails.email,
    password: personalDetails.password,
    role: 'driver',
    phone: personalDetails.phone,
    isActive: true // Must be true so they can login and see status, but approvalStatus guards access
  });

  const driverIdStr = user._id.toString();

  // Create Driver profile
  const driver = await Driver.create({
    userId: user._id,
    phone: personalDetails.phone,
    licenseNumber: professionalDetails.licenseNumber ? professionalDetails.licenseNumber : undefined,
    licenseExpiry: professionalDetails.licenseExpiry ? new Date(professionalDetails.licenseExpiry) : undefined,
    dob: personalDetails.dob ? new Date(personalDetails.dob) : undefined,
    gender: personalDetails.gender,
    emergencyContact: personalDetails.emergencyContact,
    address: {
      village: addressDetails?.village,
      taluk: addressDetails?.taluk,
      district: addressDetails?.district,
      state: addressDetails?.state,
      pincode: addressDetails?.pincode,
      fullAddress: addressDetails?.fullAddress
    },
    experienceYears: professionalDetails?.experienceYears || 0,
    tractorExperienceYears: professionalDetails?.tractorExperienceYears || 0,
    otherMachinery: professionalDetails?.otherMachinery,
    languages: professionalDetails?.languages || [],
    preferredDistricts: professionalDetails?.preferredDistricts || [],
    profileStatus: 'INCOMPLETE',
    verificationStatus: 'PENDING_DOCUMENTS',
    isApproved: false,
    approvalStatus: 'INCOMPLETE'
  });

  // Save bank details
  const bank = await DriverBankDetails.create({
    driverId: driver._id,
    accountHolderName: bankDetails?.accountHolderName || personalDetails.name,
    bankName: bankDetails?.bankName,
    accountNumber: bankDetails?.accountNumber,
    ifscCode: bankDetails?.ifscCode,
    upiId: bankDetails?.upiId
  });

  // Save files
  const savedDocs = [];
  if (documents && typeof documents === 'object') {
    for (const [docType, base64Data] of Object.entries(documents)) {
      if (base64Data) {
        try {
          const fileUrl = saveBase64File(base64Data, 'documents', driverIdStr, docType);
          if (fileUrl) {
            const document = await DriverDocument.create({
              driverId: driver._id,
              documentType: docType,
              fileUrl,
              status: 'pending'
            });
            savedDocs.push(document);
          }
        } catch (err) {
          console.error(`Error saving document ${docType}:`, err.message);
        }
      }
    }
  }

  // Create Driver Application entry
  await DriverApplication.create({
    driverId: driver._id,
    status: 'PENDING_APPROVAL',
    history: [
      {
        status: 'PENDING_APPROVAL',
        comments: 'Application started. Pending profile completion and documents.',
        updatedAt: new Date()
      }
    ]
  });

  // Create registration notification
  await DriverNotification.create({
    driverId: driver._id,
    type: 'registration_submitted',
    title: 'Registration Submitted',
    message: 'Your application has been submitted successfully. Our team will review your documents and approve your account within 24-72 hours.'
  });

  // Generate JWT token
  const token = generateToken(user._id, user.role);
  user.password = undefined;

  return success(res, { user, profile: driver, bank, documents: savedDocs, token }, 'Driver registration submitted successfully.', 201);
});

module.exports = {
  registerFarmer,
  registerDriver,
  login,
  getMe
};
