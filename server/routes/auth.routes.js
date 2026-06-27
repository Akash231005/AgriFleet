const express = require('express');
const router = express.Router();
const { registerFarmer, registerDriver, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerFarmer);
router.post('/register-driver', registerDriver);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;

