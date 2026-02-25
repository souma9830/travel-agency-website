const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            userData: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { sendEmail } = require('../config/emailConfig');

const sendOtp = async (req, res) => {
    const { email } = req.body;
    const { type } = req.body; // 'password-reset' or 'verification'

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = type === 'password-reset' ? 15 * 60 * 1000 : 10 * 60 * 1000;
        
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + otpExpiry;
        await user.save();

        const isPasswordReset = type === 'password-reset';
        const expiryMinutes = isPasswordReset ? 15 : 10;
        const title = isPasswordReset ? 'Reset Your Password' : 'Verify Your Account';
        const text = isPasswordReset 
            ? `Your OTP for password reset is ${otp}. It is valid for ${expiryMinutes} minutes.`
            : `Your verification OTP is ${otp}. It is valid for ${expiryMinutes} minutes. Please do not share it with anyone.`;
        const subject = isPasswordReset ? 'Password Reset OTP 🔐' : 'Verification OTP 🔐';
        const otpColor = isPasswordReset ? '#2980b9' : '#27ae60';

        const mailOption = {
            to: email,
            subject: subject,
            text: text,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">${title}</h2>
                    <p style="font-size: 16px; color: #34495e;">Hello,</p>
                    <p style="font-size: 16px; color: #34495e;">Your verification OTP is:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${otpColor};">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #7f8c8d;">This OTP is valid for <b>${expiryMinutes} minutes</b>. Please do not share it with anyone.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #bdc3c7; text-align: center;">&copy; ${new Date().getFullYear()} TravelAgency Team</p>
                </div>
            `
        };

        await sendEmail(mailOption);

        res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Aliases for backward compatibility
const sendPasswordResetOtp = (req, res) => sendOtp({ ...req, body: { ...req.body, type: 'password-reset' } }, res);
const forgotOtp = (req, res) => sendOtp({ ...req, body: { ...req.body, type: 'verification' } }, res);

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpire = 0;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        // Since we are using JWT in localStorage, backend logout is mostly symbolic.
        // If we were using cookies, we would clear the cookie here.
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { register, login, sendPasswordResetOtp, resetPassword, forgotOtp, logout };
