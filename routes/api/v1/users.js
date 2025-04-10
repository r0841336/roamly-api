const express = require('express');
const router = express.Router();
const { register, login, me } = require('../../../controllers/api/v1/Users');
const authenticate = require('../../../middleware/authenticate'); // De authenticatie-middleware

// Registratie route
router.post('/register', register);

// Login route
router.post('/login', login);

// Me route (beschermde route om de ingelogde gebruiker op te halen)
router.get('/me', authenticate, me);

module.exports = router;
