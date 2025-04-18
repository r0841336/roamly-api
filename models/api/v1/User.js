const mongoose = require('mongoose');

// Definieer het schema voor een gebruiker
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    country: {
        type: String,
    },
    postcode: {
        type: String,
    },
    city: {
        type: String,
    },
    street: {
        type: String,
    },
    houseNumber: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
}, {
    timestamps: true,
});

// Maak een User model
const User = mongoose.model('User', userSchema);

module.exports = User;
