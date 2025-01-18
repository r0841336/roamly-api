const Trip = require("../../../models/api/v1/Trip");

// function to create a new order
const create = async (req, res) => {
    const { TripName, Place, StartDate, EndDate } = req.body; // Correct gebruik van req.body

    if (!TripName || !Place || !StartDate || !EndDate) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    try {
        const trip = new Trip({
            TripName,
            Place,
            StartDate,
            EndDate
        });
        await trip.save();
        res.json({
            status: "success",
            data: { trip }
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};


module.exports = {
    create,
    index,
};