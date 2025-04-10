const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/api/v1/User'); // Zorg ervoor dat je model voor User goed is ingesteld!

// Registratie functie (POST)
const register = async (req, res) => {
    const { email, password } = req.body;

    // Controleer of alle vereiste velden aanwezig zijn
    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        // Controleer of de gebruiker al bestaat
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "E-mail is al geregistreerd.",
            });
        }

        // Hash het wachtwoord
        const hashedPassword = await bcrypt.hash(password, 10);

        // Maak een nieuwe gebruiker aan
        const user = new User({
            email,
            password: hashedPassword,
        });

        // Sla de gebruiker op in de database
        await user.save();
        res.status(201).json({
            status: "success",
            data: { user },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het registreren.",
            error: error.message,
        });
    }
};

// Login functie (POST)
const login = async (req, res) => {
    const { email, password } = req.body;

    // Controleer of de vereiste velden aanwezig zijn
    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        // Zoek de gebruiker op basis van e-mail
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige inloggegevens.",
            });
        }

        // Vergelijk het ingevoerde wachtwoord met het gehashte wachtwoord
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige inloggegevens.",
            });
        }

        // Genereer een JWT-token
        const token = jwt.sign({ userId: user._id }, 'je_geheime_sleutel', { expiresIn: '1h' });

        res.status(200).json({
            status: "success",
            data: { token },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het inloggen.",
            error: error.message,
        });
    }
};

// Functie om een gebruiker te verkrijgen op basis van token
const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId); // Gebruiker op basis van de userId uit de JWT
        res.json({
            status: "success",
            data: { user },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Interne server fout",
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    me,
};
