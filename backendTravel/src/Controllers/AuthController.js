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

const sendPasswordResetOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 15 * 60 * 1000; // 15 mins
        await user.save();

        const mailOption = {
            to: email,
            subject: 'Password Reset OTP 🔐',
            text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Reset Your Password</h2>
                    <p style="font-size: 16px; color: #34495e;">Hello,</p>
                    <p style="font-size: 16px; color: #34495e;">We received a request to reset your password. Use the OTP below to proceed:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2980b9;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #7f8c8d;">This OTP is valid for <b>15 minutes</b>. Please do not share it with anyone.</p>
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

const forgotOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is Required" })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.resetOtp = String(otp);
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();
        const mailOption = {
            to: email,
            subject: "Resend Verification Otp 🔐",
            text: `Hey User Your Resend Verification otp is ${otp} This OTP is valid for 10 minutes.
Please do not share it with anyone.

— Team TravelAgency`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Verify Your Account</h2>
                    <p style="font-size: 16px; color: #34495e;">Hello,</p>
                    <p style="font-size: 16px; color: #34495e;">Your verification OTP is:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #27ae60;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #7f8c8d;">This OTP is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #bdc3c7; text-align: center;">&copy; ${new Date().getFullYear()} TravelAgency Team</p>
                </div>
            `
        }
        sendEmail(mailOption).catch(err => {
            console.log("otp mailed failed", err.message);
        })
        return res.status(201).json({ success: true, message: "otp send to mail", next: "verify the otp" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

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
