const Trip = require("../../../models/api/v1/Trip");

// function to create a new order
const create = (req, res) => {
    const sneaker = req.body.order.sneaker;
    const size = req.body.order.size;
    const price = req.body.order.price;
    const amount = req.body.order.amount;
    const image = req.body.order.image;
    const configs = req.body.order.sneakerConfigs;
    const firstname = req.body.order.firstname;
    const lastname = req.body.order.lastname;
    const email = req.body.order.email;
    const telephone = req.body.order.tel;
    const address = req.body.order.address;
    const payment = req.body.order.payment;
    const status = req.body.order.status;

    const date = new Date();
    date.setHours(date.getHours() + 1);
    const updatedDate = date.toJSON();
    
    const trip = new Trip({ 
        sneaker: sneaker,
        size: size,
        price: price,
        amount: amount,
        image: image, 
        sneakerConfigs: configs,
        firstname: firstname,
        lastname: lastname,
        telephone: telephone,
        email: email,
        address: address,
        payment: payment,
        date: updatedDate,
        status: status,
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
        const trips = await Order.find({});
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