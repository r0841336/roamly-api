const Trip = require("../../../models/api/v1/Trip");

// function to create a new order
const create = (req, res) => {
    const TripName = req.TripName;
    const Place = req.Place;
    const StartDate = req.StartDate;
    const EndDate = req.EndDate;
    
    const trip = new Trip({ 
        TripName: TripName,
        Place: Place,
        StartDate: StartDate,
        EndDate: EndDate
    });
    
    trip.save().then(() => {
        res.json({
            status: "success",
            data: {
                trip: trips,
            },
        });
    });
};

// function to get all the orders
const index = async (req, res) => {
    try {
        const trips = await Trip.find({});
        res.json({
            status: "success",
            data: {
                trips: trips,
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