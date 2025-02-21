const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  TripName: { type: String, required: true },
  Place: { type: String, required: true },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date, required: true },
  Plan: { type: Object, required: true }, // Nieuw veld voor het JSON-reisplan
});

module.exports = mongoose.model("Trip", TripSchema);
