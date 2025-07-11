const ratingModel = require('../models/ratingModel');

exports.submitRating = (req, res) => {
  const userId = req.user.id;
  const { storeId, rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  ratingModel.submitOrUpdateRating(userId, storeId, rating, (err) => {
    if (err) return res.status(500).json({ message: 'Error submitting rating' });
    res.json({ message: 'Rating submitted successfully' });
  });
};

exports.getAverageRating = (req, res) => {
  const storeId = req.params.storeId;
  ratingModel.getAverageRating(storeId, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching average rating' });
    res.json(result[0]);
  });
};

exports.getUserRating = (req, res) => {
  const userId = req.user.id;
  const storeId = req.params.storeId;
  ratingModel.getUserRatingForStore(userId, storeId, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching your rating' });
    res.json(result[0] || {});
  });
};

exports.getStoreRatings = (req, res) => {
  const storeId = req.params.storeId;
  ratingModel.getStoreRatings(storeId, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error fetching store ratings' });
    res.json(result);
  });
};
