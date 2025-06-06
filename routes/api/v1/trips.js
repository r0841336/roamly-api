const express = require('express');
const router = express.Router();
const authenticate = require('../../../middleware/Authentication');
const { create, index } = require('../../../controllers/api/v1/trips');

router.post('/', authenticate, create); // 👈 protect the route
router.get('/', authenticate, index);  // 👈 protect the route
router.delete('/:id', authenticate, tripController.deleteTrip);

module.exports = router;