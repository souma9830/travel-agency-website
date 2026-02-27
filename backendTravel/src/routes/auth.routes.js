const express = require('express');
const router = express.Router();
const { register, login, sendPasswordResetOtp, resetPassword, forgotOtp, logout, getProfile, updateProfile } = require('../Controllers/AuthController');
const userAuth = require('../middlware/userAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-reset-otp', sendPasswordResetOtp);
router.post('/reset-password', resetPassword);
router.post('/forgot-otp', forgotOtp);
router.post('/logout', logout);

router.get('/get-profile', userAuth, getProfile);
router.post('/update-profile', userAuth, updateProfile);

module.exports = router;
