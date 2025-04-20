// middleware/authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../models/api/v1/User'); // Zorg dat pad klopt!

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Toegang geweigerd. Geen token verstrekt.",
        });
    }

    try {
        const decoded = jwt.verify(token, 'je_geheime_sleutel');

        // Zoek gebruiker met het juiste ID én token
        const user = await User.findOne({ _id: decoded.userId, token });

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Token ongeldig of niet gevonden in database.",
            });
        }

        req.user = { userId: user._id };
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Ongeldig of verlopen token.",
        });
    }
};

module.exports = authenticate;
