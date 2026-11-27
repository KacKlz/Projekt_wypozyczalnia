const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        const token = req.cookies && req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Brak autoryzacji"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Nieprawidlowy lub wygasly token"
        });
    }
}

module.exports = authMiddleware;

