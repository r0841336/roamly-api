// routes/api/v1/users.js
const express = require('express');
const router = express.Router();
const { register, login, me } = require('../../../controllers/api/v1/Users');
const authenticate = require('../../../middleware/Authentication'); // Importeer de authenticate middleware

// Registratie route
router.post('/register', register);

// Login route
router.post('/login', login);

router.get('/me', authenticate, me);

// Nieuwe route voor het ophalen van alle gebruikers
router.get('/', authenticate, async (req, res) => {
    try {
        // Haal alle gebruikers op uit de database
        const users = await User.find();
        
        // Retourneer de gebruikersdata
        res.status(200).json({
            status: "success",
            data: { users }
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het ophalen van de gebruikers.",
            error: error.message,
        });
    }
});

module.exports = router;
