const express = require('express');
const router = express.Router();
const ratingModel = require('../models/ratingModel');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// 📝 Submit or update rating (Authenticated users only)
router.post('/submit', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { storeId, rating } = req.body;

  if (!storeId || rating === undefined) {
    return res.status(400).json({ message: 'Store ID and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  ratingModel.submitRating(userId, storeId, rating, (err) => {
    if (err) return res.status(500).json({ error: 'Error submitting rating' });
    res.json({ message: 'Rating submitted successfully' });
  });
});

// 🔍 Get all ratings for a store
router.get('/store/:id', (req, res) => {
  const storeId = req.params.id;

  ratingModel.getRatingsByStoreId(storeId, (err, ratings) => {
    if (err) return res.status(500).json({ error: 'Error fetching ratings' });
    res.json(ratings);
  });
});

// 🔍 Get all ratings by a user
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  ratingModel.getRatingsByUserId(userId, (err, ratings) => {
    if (err) return res.status(500).json({ error: 'Error fetching ratings' });
    res.json(ratings);
  });
});

// ⭐ Get average rating of a store
router.get('/average/:storeId', (req, res) => {
  const storeId = req.params.storeId;

  ratingModel.getAverageRatingByStoreId(storeId, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error calculating average rating' });

    const avg = result[0].averageRating;
    res.json({ averageRating: avg ? parseFloat(avg).toFixed(2) : null });
  });
});

// ✅ 🧾 Get ratings with user info for a specific store
router.get('/store/:id/details', verifyToken, verifyRole(['owner', 'admin']), (req, res) => {
  const storeId = req.params.id;

  ratingModel.getRatingsWithUserDetailsByStoreId(storeId, (err, ratings) => {
    if (err) return res.status(500).json({ error: 'Error fetching rating details' });
    res.json(ratings);
  });
});

module.exports = router;
