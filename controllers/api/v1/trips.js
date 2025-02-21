const Trip = require("../../../models/api/v1/Trip");

// Function to create a new trip
const create = async (req, res) => {
    const { TripName, Place, StartDate, EndDate } = req.body;

    // Validate required fields
    if (!TripName || !Place || !StartDate || !EndDate) {
        return res.status(400).json({
            status: "error",
            message: "All fields (TripName, Place, StartDate, EndDate) are required.",
        });
    }

    // Validate dates
    const startDateValid = !isNaN(new Date(StartDate));
    const endDateValid = !isNaN(new Date(EndDate));
    if (!startDateValid || !endDateValid) {
        return res.status(400).json({
            status: "error",
            message: "Invalid date format for StartDate or EndDate.",
        });
    }

    if (new Date(EndDate) < new Date(StartDate)) {
        return res.status(400).json({
            status: "error",
            message: "EndDate cannot be earlier than StartDate.",
        });
    }

    try {
        const trip = new Trip({ TripName, Place, StartDate, EndDate });
        await trip.save();
        res.json({
            status: "success",
            data: { trip },
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error saving trip:", error: error.message });
    }
};

// Function to get all trips
const index = async (req, res) => {
    try {
        const trips = await Trip.find({});
        res.json({
            status: "success",
            data: {
                trips: trips || [],
            },
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Internal server error:", error: error.message });
    }
};

module.exports = {
    create,
    index,
};
