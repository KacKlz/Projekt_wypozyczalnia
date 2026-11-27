const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
    const token = req.cookies && req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Brak autoryzacji"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: "Nieprawidlowy lub wygasly token"
        });
    }

    try {
        // A token stays valid for 7 days, even after the account is deleted,
        // so check that the user still exists before letting the request through
        const userExists = await User.exists({ _id: decoded.userId });

        if (!userExists) {
            return res.status(401).json({
                message: "Uzytkownik nie istnieje"
            });
        }
    } catch (error) {
        console.error("Blad weryfikacji uzytkownika:", error);

        return res.status(500).json({
            message: "Blad serwera"
        });
    }

    req.userId = decoded.userId;
    next();
}

module.exports = authMiddleware;
