const mongoose = require("mongoose");
const Trip = mongoose.model("Trip", { 
    TripName: String,
    Place: String,
    StartDate: String,
    EndDate: String
});

module.exports = Trip;