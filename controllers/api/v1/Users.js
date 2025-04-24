const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email en wachtwoord zijn verplicht.",
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: "E-mail is al geregistreerd.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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

        // Maak token aan na registratie
        const token = jwt.sign({ userId: user._id }, 'je_geheime_sleutel', { expiresIn: '1h' });
        user.token = token;
        await user.save();

        res.status(201).json({
            status: "success",
            data: { user, token },
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
        user.token = token;
        await user.save();

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

// Wachtwoord reset aanvragen functie (POST /forgot-password)
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            status: "error",
            message: "Email is verplicht.",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Gebruiker niet gevonden.",
            });
        }

        // Genereer een willekeurige resetcode
        const resetPasswordCode = crypto.randomBytes(6).toString('hex');
        const resetPasswordExpire = Date.now() + 3600000; // Code vervalt na 1 uur

        // Sla de resetcode en vervaldatum op in de database
        user.resetPasswordCode = resetPasswordCode;
        user.resetPasswordExpire = resetPasswordExpire;
        await user.save();

        // Verzend een e-mail met de resetcode (gebruik bijvoorbeeld nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // Gebruik je eigen service en instellingen
            auth: {
                user: 'dante.verbiest@gmail.com',
                pass: 'jldg jrqj qxdf cabr',
            }
        });

        const mailOptions = {
            to: user.email,
            from: 'your-email@gmail.com',
            subject: 'Wachtwoord Reset Verzoek',
            text: `Gebruik de volgende code om je wachtwoord te resetten: ${resetPasswordCode}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: "success",
            message: "Een wachtwoordreset-code is naar je e-mail gestuurd.",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het versturen van de resetcode.",
            error: error.message,
        });
    }
};

// Wachtwoord resetten functie (POST /reset-password)
const resetPassword = async (req, res) => {
    const { email, resetPasswordCode, newPassword } = req.body;

    if (!email || !resetPasswordCode || !newPassword) {
        return res.status(400).json({
            status: "error",
            message: "Alle velden zijn verplicht.",
        });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "Gebruiker niet gevonden.",
            });
        }

        // Controleer of de resetcode overeenkomt en niet verlopen is
        if (user.resetPasswordCode !== resetPasswordCode) {
            return res.status(400).json({
                status: "error",
                message: "Ongeldige resetcode.",
            });
        }

        if (Date.now() > user.resetPasswordExpire) {
            return res.status(400).json({
                status: "error",
                message: "De resetcode is verlopen.",
            });
        }

        // Wachtwoord opnieuw instellen
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordCode = undefined; // Verwijder de code na gebruik
        user.resetPasswordExpire = undefined; // Verwijder de vervaldatum
        await user.save();

        res.status(200).json({
            status: "success",
            message: "Je wachtwoord is succesvol gewijzigd.",
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Er is een fout opgetreden bij het resetten van het wachtwoord.",
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    me,
    forgotPassword,
    resetPassword
};
