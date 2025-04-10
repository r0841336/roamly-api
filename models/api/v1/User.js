const mongoose = require('mongoose');

// Definieer het schema voor een gebruiker
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Zorg ervoor dat e-mails uniek zijn
        lowercase: true, // E-mail wordt altijd in kleine letters opgeslagen
    },
    password: {
        type: String,
        required: true, // Wachtwoord is verplicht
    },
}, {
    timestamps: true, // Dit voegt automatisch `createdAt` en `updatedAt` toe aan het schema
});

// Maak een User model
const User = mongoose.model('User', userSchema);

module.exports = User;
