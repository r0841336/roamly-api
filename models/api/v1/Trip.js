const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
    TripName: destination,
    Place: destination,
    StartDate: dates[0].toISOString(),
    EndDate: dates[1].toISOString(),
    Plan: cleanedResponse,
});

module.exports = mongoose.model("Trip", TripSchema);
