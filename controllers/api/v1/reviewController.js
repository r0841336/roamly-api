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

    const updateData = req.body; // wat je binnenkrijgt
    const section = Object.keys(updateData)[0]; // bijvoorbeeld 'parking', 'entrance', etc.

    if (section && review[section] !== undefined) {
      // Alleen die specifieke sectie updaten
      review[section] = { 
        ...review[section], 
        ...updateData[section] 
      };

      // Punten automatisch verhogen
      review.points = (review.points || 0) + 1;

      // Sectie markeren als completed
      if (!review.sectionsCompleted.includes(section)) {
        review.sectionsCompleted.push(section);
      }

      await review.save();
      res.status(200).json(review);
    } else {
      res.status(400).send("Invalid update data");
    }
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
