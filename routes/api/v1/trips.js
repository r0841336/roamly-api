const express = require("express");
const router = express.Router();
const tripController = require("../../../controllers/api/v1/trips");

router.post("/", tripController.create); // Create a new order
router.get("/", tripController.index); // Get all orders

module.exports = router;