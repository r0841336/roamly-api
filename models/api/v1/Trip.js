const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    TripName: { type: String, required: true },
    Place: { type: String, required: true },
    StartDate: { type: Date, required: true },
    EndDate: { type: Date, required: true },
});

const Trip = mongoose.model("Trip", tripSchema);
module.exports = Trip;
