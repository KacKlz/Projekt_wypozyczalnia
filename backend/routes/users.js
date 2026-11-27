const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { EMAIL_REGEX } = require("../utils/validation");

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

module.exports = router;
