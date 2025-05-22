const Trip = require("../../../models/api/v1/Trip");

// ✅ Create a trip
const create = async (req, res) => {
  const { TripName, Place, StartDate, EndDate, Plan } = req.body;

  if (!TripName || !Place || !StartDate || !EndDate || !Plan) {
    return res.status(400).json({
      status: "error",
      message: "All fields (TripName, Place, StartDate, EndDate, Plan) are required.",
    });
  }

  try {
    const trip = new Trip({
      TripName,
      Place,
      StartDate,
      EndDate,
      Plan,
      user: req.user.userId // 👈 attach user to trip
    });

    await trip.save();

    res.status(201).json({
      status: "success",
      data: { trip },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error saving trip.",
      error: error.message,
    });
  }
};

// ✅ Get trips for the logged-in user
const index = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.userId });
    res.status(200).json({
      status: "success",
      data: { trips: trips || [] },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Export both
module.exports = {
  create,
  index
};
