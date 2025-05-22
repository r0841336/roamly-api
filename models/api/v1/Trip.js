const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    TripName: { type: String, required: true },
    Place: { type: String, required: true },
    StartDate: { type: Date, required: true },
    EndDate: { type: Date, required: true },
    Plan: { type: mongoose.Schema.Types.Mixed, required: true },
    user: { // ✅ Add this
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  });
const Trip = mongoose.model('Trip', TripSchema);

module.exports = Trip;
