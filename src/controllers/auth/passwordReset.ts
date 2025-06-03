import crypto from "crypto"
import { User } from "../../models/User";
import UserService from "../../services/UserService";
import { asyncHandler } from "../../middlewares/errorHandler";
import { sendMail } from "../../utils/mailSender";
import { hashPassword } from "../../utils/password";

const userService = new UserService(User)
const url = process.env.FRONTEND_URL

export const forgotPasswordLink = asyncHandler(async (req, res) => {
    const { email } = req.body
    if (!email) {
        res.status(400).json({
            success: false,
            message: 'Email is required!'
        })
        return
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        res.status(400).json({
            success: false,
            message: 'Invalid email format!'
        })
        return
    }

    const user = await userService.findByEmail(email)
    if (!user) {
        res.status(404).json({
            success: false,
            message: "User not found."
        })
        return
    }

    // Generate token & expiry
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15);

    await userService.updateUser(email, { resetToken, resetTokenExpires });

    // Send the token via email
    const resetLink = `https://${url}/reset-password?token=${resetToken}&email=${email}`;

    await sendMail(
        email,
        "Reset Your Password - Car Dealer API",
        `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password for your Car Dealer API account.</p>
            <p>
                <a href="${resetLink}" style="color: #1a73e8; text-decoration: none; font-weight: bold;">
                    Reset Password
                </a>
            </p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>This link will expire in 15 minutes.</p>
            <p>Best regards,<br/>The Car Dealer Team</p>
        </div>
        `
    )

    res.status(200).json({
        success: true,
        message: "Password reset email successfully."
    })
})

export const resetPassword = asyncHandler(async (req, res) => {
    const {  email, resetToken, newPassword } = req.body    

    const user = await userService.findByEmail(email)
    if (!user || user.resetToken !== resetToken || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            res.status(400).json({
            success: false,
            message: 'Invalid email or expired reset token!'
        })
        return
    }

    const hashedPassword = await hashPassword(newPassword);

    // update the password and destroying the token
    await userService.updateUser(email, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
    });

    res.status(200).json({
        success: true,
        message: "Password reset successfully."
    })
})