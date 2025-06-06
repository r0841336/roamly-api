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

// ✅ Delete a trip
const deleteTrip = async (req, res) => {
  const tripId = req.params.id;

  if (!tripId) {
    return res.status(400).json({
      status: "error",
      message: "Trip ID is required.",
    });
  }

  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user.userId });
    if (!trip) {
      return res.status(404).json({
        status: "error",
        message: "Trip not found or no permission.",
      });
    }

    await Trip.deleteOne({ _id: tripId });

    res.status(200).json({
      status: "success",
      message: "Trip successfully deleted.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting trip.",
      error: error.message,
    });
  }
};

// ✅ Add an activity to a specific day in a trip
const addActivityToDay = async (req, res) => {
  const { tripId, dayIndex, activity } = req.body;

  if (!tripId || dayIndex === undefined || !activity) {
    return res.status(400).json({
      status: "error",
      message: "Trip ID, dayIndex, and activity are required.",
    });
  }

  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user.userId });
    if (!trip) {
      return res.status(404).json({
        status: "error",
        message: "Trip not found or no permission.",
      });
    }

    // Parse plan if stored as string
    let plan = typeof trip.Plan === "string" ? JSON.parse(trip.Plan) : trip.Plan;

    // Check if day exists
    if (!plan.itinerary || !plan.itinerary[dayIndex]) {
      return res.status(400).json({
        status: "error",
        message: "Invalid day index.",
      });
    }

    // Add activity
    plan.itinerary[dayIndex].activities.push(activity);

    // Save updated plan
    trip.Plan = JSON.stringify(plan);
    await trip.save();

    res.status(200).json({
      status: "success",
      message: `Activity added to Day ${dayIndex + 1}.`,
      data: { trip },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error adding activity.",
      error: error.message,
    });
  }
};
const removeItemFromTrip = async (req, res) => {
  const { tripId, dayIndex, item, type } = req.body;

  if (!tripId || !item || !type) {
    return res.status(400).json({ message: "tripId, item, and type are required." });
  }

  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user.userId });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found or unauthorized." });
    }

    let plan = typeof trip.Plan === "string" ? JSON.parse(trip.Plan) : trip.Plan;

    if (!plan.itinerary || !Array.isArray(plan.itinerary)) {
      return res.status(400).json({ message: "Invalid trip structure." });
    }

    if (type === "activity") {
      plan.itinerary[dayIndex].activities = plan.itinerary[dayIndex].activities.filter(a => a !== item);
    } else if (type === "restaurant") {
      plan.itinerary[dayIndex].restaurants = plan.itinerary[dayIndex].restaurants.filter(r => r !== item);
    } else if (type === "hotel") {
      plan.hotel = null;
    } else {
      return res.status(400).json({ message: "Invalid item type." });
    }

    trip.Plan = JSON.stringify(plan);
    await trip.save();

    res.status(200).json({ status: "success", message: "Item removed from trip." });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error while removing item.",
      error: error.message,
    });
  }
};

// ✅ Export all functions
module.exports = {
  create,
  index,
  deleteTrip,
  addActivityToDay, 
  removeItemFromTrip
};
