// middleware/authenticate.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Haal het token uit de 'Authorization' header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Als er geen token is
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Toegang geweigerd. Geen token verstrekt.",
        });
    }

    try {
        // Verifieer het token
        const decoded = jwt.verify(token, 'je_geheime_sleutel');
        req.user = { userId: decoded.userId }; // Zet de gedecodeerde informatie in de request
        next(); // Ga verder met de volgende middleware of controller
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Ongeldig of verlopen token.",
        });
    }
};

module.exports = authenticate;
