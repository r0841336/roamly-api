con// routes/api/v1/users.js
const express = require('express');
const router = express.Router();
const { register, login, me } = require('../../../controllers/api/v1/Users');
const authenticate = require('../../../middleware/authenticate'); // Importeer de authenticate middleware

// Registratie route
router.post('/register', register);

// Login route
router.post('/login', login);

// Beschermde route voor het ophalen van gebruikersgegevens
router.get('/me', authenticate, me); // Voeg de authenticate middleware toe

module.exports = router;
