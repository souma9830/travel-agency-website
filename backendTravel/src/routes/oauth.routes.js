const express = require('express');
const router = express.Router();
const { googleAuth, googleCallback } = require('../Controllers/OAuthController');

// Route to initiate Google OAuth
router.get('/google', googleAuth);

// Route to handle Google OAuth callback
router.get('/callback/google', googleCallback);

module.exports = router;