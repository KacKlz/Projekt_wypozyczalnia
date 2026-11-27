const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");
const { passwordChangeLimiter } = require("../middleware/rateLimit");
const { EMAIL_REGEX, validatePassword } = require("../utils/validation");

const router = express.Router();

// PATCH /api/users/me - Update the logged-in user's name and email
router.patch("/me", authMiddleware, async (req, res) => {
    // Express 5: req.body is undefined when no JSON was sent
    const { imie, email } = req.body ?? {};

    if (typeof imie !== "string" || typeof email !== "string") {
        return res.status(400).json({ message: "Invalid data." });
    }

    const trimmedName = imie.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
        return res.status(400).json({ message: "First name must be at least 2 characters." });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email address." });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Only these two fields can be changed here (never role or hasloHash)
        user.imie = trimmedName;
        user.email = normalizedEmail;
        await user.save();

        // Same shape as GET /api/auth/me, so the frontend can update its state directly
        return res.json({ email: user.email, imie: user.imie, role: user.role });
    } catch (error) {
        // 11000 = duplicate key: the email is already used by another account
        if (error.code === 11000) {
            return res.status(409).json({ message: "This email is already in use." });
        }

        console.error("PATCH /api/users/me error:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

// PATCH /api/users/me/password - Change the logged-in user's password
router.patch("/me/password", authMiddleware, passwordChangeLimiter, async (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        return res.status(400).json({ message: "Invalid data." });
    }

    // Same rules as registration (utils/validation.js)
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
        return res.status(400).json({ message: passwordError, field: "newPassword" });
    }

    if (newPassword === currentPassword) {
        return res.status(400).json({ message: "New password must be different from the current one.", field: "newPassword" });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // The only place where the current password can be verified: against the stored hash
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hasloHash);

        // 400, not 401: the user is logged in, only the entered password is wrong
        // "field" tells the frontend which input the error belongs to
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect.", field: "currentPassword" });
        }

        // 12 salt rounds, same as registration
        user.hasloHash = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.json({ message: "Password updated." });
    } catch (error) {
        console.error("PATCH /api/users/me/password error:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/users/me - Delete the logged-in user's account
router.delete("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // There must always be at least one admin in the system
        if (user.role === "admin") {
            const adminCount = await User.countDocuments({ role: "admin" });

            if (adminCount <= 1) {
                return res.status(403).json({
                    message: "You are the only admin. Add another admin before deleting this account."
                });
            }
        }

        // Do not delete an account during an ongoing or upcoming rental
        const hasActiveBookings = await Booking.exists({
            userId: user._id,
            status: { $in: ["active", "upcoming"] }
        });

        if (hasActiveBookings) {
            return res.status(409).json({
                message: "Cancel or return your active bookings before deleting your account."
            });
        }

        // MongoDB has no cascade delete, so remove the booking history explicitly
        await Booking.deleteMany({ userId: user._id });
        await User.deleteOne({ _id: user._id });

        // Same options as POST /api/auth/logout, otherwise the cookie is not removed
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return res.json({ message: "Account deleted." });
    } catch (error) {
        console.error("DELETE /api/users/me error:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
