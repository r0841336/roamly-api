const express = require('express');
const router = express.Router();
const authenticate = require('../../../middleware/Authentication');
const tripController = require('../../../controllers/api/v1/trips'); // ✅ correcte import

router.post('/', authenticate, tripController.create);
router.get('/', authenticate, tripController.index);
router.delete('/:id', authenticate, tripController.deleteTrip);

module.exports = router;
