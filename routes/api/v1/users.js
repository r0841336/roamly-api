const express = require('express');
const router = express.Router();
const { register, login, me, forgotPassword, resetPassword } = require('../../../controllers/api/v1/Users');
const authenticate = require('../../../middleware/Authentication');
const User = require('../../../models/api/v1/User');

// Registratie route
router.post('/register', register);

// Login route
router.post('/login', login);

// Profiel ophalen route (met authenticatie)
router.get('/me', authenticate, me);

// Profiel bijwerken route (met authenticatie)
router.patch('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Gebruiker niet gevonden' });

        // Beschermde velden mogen niet gewijzigd worden via deze route
        const protectedFields = ['email', 'password', 'token', 'resetPasswordCode', 'resetPasswordExpire'];
        protectedFields.forEach(field => delete req.body[field]);

        Object.assign(user, req.body); // Pas de toegestane velden toe
        await user.save(); // Triggert eventuele mongoose middleware

        res.status(204).end(); // Geen content, update was succesvol
    } catch (error) {
        console.error('Fout bij het updaten van profiel:', error);
        res.status(400).json({ error: error.message });
    }
});

// Nieuwe route voor het aanvragen van een wachtwoordreset
router.post('/forgot-password', forgotPassword);

// Nieuwe route voor het resetten van het wachtwoord
router.post('/reset-password', resetPassword);

// Route voor het ophalen van alle gebruikers (beveiligd)
router.get('/', authenticate, async (req, res) => {
    try {
        const users = await User.find();
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
