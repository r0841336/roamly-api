const express = require('express');
const router = express.Router();
const reviewController = require('../../../controllers/api/v1/reviewController');

// Routes
router.post('/', reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.patch('/:id', reviewController.updateReviewPartial); // PATCH toegevoegd
router.delete('/:id', reviewController.deleteReview);
router.get('/user/:userId', reviewController.getReviewsByUserId);

module.exports = router;
