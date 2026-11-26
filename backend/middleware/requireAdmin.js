const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Lets the request through only for a logged-in admin
async function requireAdmin(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Not authorized"
        });
    }

    let user;

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        user = await User.findById(decoded.userId)
            .select("role");

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

    if (!user) {
        return res.status(401).json({
            message: "User does not exist"
        });
    }

    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access only"
        });
    }

    return next();
}

module.exports = requireAdmin;
