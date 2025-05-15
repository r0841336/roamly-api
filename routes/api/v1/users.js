const express = require('express');
const router = express.Router();
const { register, login, me, forgotPassword, resetPassword, verifyResetCode } = require('../../../controllers/api/v1/Users'); // Vergeet niet verifyResetCode toe te voegen
const authenticate = require('../../../middleware/Authentication'); // Importeer de authenticate middleware
const User = require('../../../models/api/v1/User');

router.get('/users/profile-picture', authMiddleware, userController.getProfilePicture);
router.post('/users/profile-picture', authMiddleware, userController.setProfilePicture);
router.put('/users/profile-picture', authMiddleware, userController.updateProfilePicture);

// Registratie route
router.post('/register', register);

// Login route
router.post('/login', login);

// Profiel ophalen route (met authenticatie)
router.get('/me', authenticate, me);

// Nieuwe route voor het aanvragen van een wachtwoordreset
router.post('/forgot-password', forgotPassword);

// Nieuwe route voor het resetten van het wachtwoord
router.post('/reset-password', resetPassword);

// Nieuwe route voor het verifiëren van de resetcode
router.post('/verify-reset-code', verifyResetCode); // Toegevoegd

// Nieuwe route voor het ophalen van alle gebruikers (beschermd met authenticatie)
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
