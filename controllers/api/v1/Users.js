const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../models/api/v1/User');

// Registratie functie (POST)
const register = async (req, res) => {
    const {
        email,
        password,
        firstName,
        lastName,
        country,
        postcode,
        city,
        street,
        houseNumber,
        phoneNumber,
        gender
    } = req.body;

    // Controleer of verplichte velden aanwezig zijn
    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        // Check of de gebruiker al bestaat
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "E-mail is al geregistreerd.",
            });
        }

        // Hash wachtwoord
        const hashedPassword = await bcrypt.hash(password, 10);

        // Nieuwe gebruiker aanmaken
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            country,
            postcode,
            city,
            street,
            houseNumber,
            phoneNumber,
            gender
        });

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

    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige inloggegevens.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige inloggegevens.",
            });
        }

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

// Profiel ophalen (GET /me)
const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
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
