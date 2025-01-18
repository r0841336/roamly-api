const Trip = require("../../../models/api/v1/Trip");

// Function to create a new trip
const create = (req, res) => {
    const { TripName, Place, StartDate, EndDate } = req.body;

    const trip = new Trip({
        TripName,
        Place,
        StartDate,
        EndDate
    });

    trip.save()
        .then(() => {
            res.json({
                status: "success",
                data: {
                    trip, // Correct variable for the created trip
                },
            });
        })
        .catch((error) => {
            res.status(500).json({ status: "error", message: "Error saving trip:", error: error.message });
        });
};

// Function to get all trips
const index = async (req, res) => {
    try {
        const trips = await Trip.find({}); // Fetch all trips from the database
        res.json({
            status: "success",
            data: {
                trips, // Correctly sending the list of trips
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
