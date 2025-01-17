const mongoose = require("mongoose");
const Trip = mongoose.model("Trip", { 
    sneaker: String,
    size: Number,
    price: Number,
    amount: Number,
    image: String,
    sneakerConfigs: Array,
    firstname: String,
    lastname: String,
    email: String,
    telephone: String,
    address: Array,
    payment: Array,
    date: String, 
    status: String,
});

module.exports = Trip;