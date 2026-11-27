const { rateLimit } = require("express-rate-limit");

// Max 5 failed password changes per 15 minutes, counted per user (must run after authMiddleware)
const passwordChangeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userId,
    message: { message: "Too many attempts. Please try again in 15 minutes." }
});

module.exports = { passwordChangeLimiter };
