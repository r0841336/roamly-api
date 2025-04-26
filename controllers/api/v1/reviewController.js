const Review = require('../../../models/api/v1/Review');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    console.error('Error getting review by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a review (volledige update via PUT)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    Object.assign(review, req.body); // Kopieer nieuwe velden naar bestaande review
    await review.save(); // Save om validaties/middleware te laten draaien

    res.status(204).end(); // Succesvol zonder content
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({ error: error.message });
  }
};

// Partiële update via PATCH
exports.updateReviewPartial = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send("Not found");
    }

    // 1. Merge de data
    Object.assign(review, req.body);

    // 2. Check of er punten bij moeten komen
    if (req.body.points) {
      review.points += req.body.points; // ✅ punten bijtellen ipv overschrijven
    }
    if (req.body.sectionsCompleted) {
      if (!review.sectionsCompleted.includes(req.body.sectionsCompleted)) {
        review.sectionsCompleted.push(req.body.sectionsCompleted);
      }
    }
    await review.save();

    res.status(204).end();
  } catch (err) {
    console.error('Error partially updating review:', err);
    res.status(500).send("Error updating review");
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
};
