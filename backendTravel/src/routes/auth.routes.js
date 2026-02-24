const express = require('express');
const router = express.Router();
const { register, login, sendPasswordResetOtp, resetPassword, forgotOtp, logout } = require('../Controllers/AuthController');

router.post('/register', register);
router.post('/login', login);
router.post('/send-reset-otp', sendPasswordResetOtp);
router.post('/reset-password', resetPassword);
router.post('/forgot-otp', forgotOtp);
router.post('/logout', logout);

module.exports = router;
