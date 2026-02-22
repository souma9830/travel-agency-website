const User = require('../Models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const googleAuth = (req, res) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: `${process.env.API_URL || 'http://localhost:3000'}/api/oauth/callback/google`,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);
    res.redirect(`${rootUrl}?${qs.toString()}`);
};

const googleCallback = async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(400).json({ success: false, message: 'Google OAuth code missing' });
        }

        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: `${process.env.API_URL || 'http://localhost:3000'}/api/oauth/callback/google`,
                grant_type: 'authorization_code',
            }).toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Google OAuth token error:', tokenData);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
            return res.redirect(`${frontendUrl}?error=oauth_token_failed`);
        }

        // Fetch user profile info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userData = await userResponse.json();
        if (!userResponse.ok) {
            console.error('Google OAuth user data error:', userData);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
            return res.redirect(`${frontendUrl}?error=oauth_userinfo_failed`);
        }

        // Check if user already exists
        let user = await User.findOne({ email: userData.email });

        if (!user) {
            // Create user with random string as password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
            });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Redirect seamlessly back to frontend with token and user data
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
        const userObj = JSON.stringify({ id: user._id, name: user.name, email: user.email });
        res.redirect(`${frontendUrl}?token=${token}&user=${encodeURIComponent(userObj)}`);

    } catch (error) {
        console.error('Google OAuth Callback Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
        res.redirect(`${frontendUrl}?error=oauth_server_error`);
    }
};

module.exports = { googleAuth, googleCallback };
