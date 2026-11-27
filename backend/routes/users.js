const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { EMAIL_REGEX, validatePassword } = require("../utils/validation");

const router = express.Router();

// PATCH /api/users/me/password - Change the logged-in user's password
router.patch("/me/password", authMiddleware, async (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        return res.status(400).json({ message: "Invalid data." });
    }

    // Same rules as registration (utils/validation.js)
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    if (newPassword === currentPassword) {
        return res.status(400).json({ message: "New password must be different from the current one." });
    }

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // The only place where the current password can be verified: against the stored hash
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.hasloHash);

        // 400, not 401: the user is logged in, only the entered password is wrong
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect." });
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

module.exports = router;
