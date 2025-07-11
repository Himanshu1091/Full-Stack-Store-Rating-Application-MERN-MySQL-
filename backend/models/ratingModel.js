const db = require('../config/db');

// 📥 Get all ratings by a user
const getRatingsByUserId = (userId, callback) => {
  db.query('SELECT * FROM ratings WHERE user_id = ?', [userId], callback);
};

// 📥 Get all ratings for a store
const getRatingsByStoreId = (storeId, callback) => {
  db.query('SELECT * FROM ratings WHERE store_id = ?', [storeId], callback);
};

// 📝 Submit or update a rating
const submitRating = (userId, storeId, rating, callback) => {
  db.query(
    `INSERT INTO ratings (user_id, store_id, rating) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE rating = ?`,
    [userId, storeId, rating, rating],
    callback
  );
};

// 🔢 Get average rating for a store
const getAverageRatingByStoreId = (storeId, callback) => {
  db.query(
    'SELECT AVG(rating) as averageRating FROM ratings WHERE store_id = ?',
    [storeId],
    callback
  );
};

// 📋 Get ratings for a store including user details
const getRatingsWithUserDetailsByStoreId = (storeId, callback) => {
  db.query(
    `SELECT r.user_id, u.name AS user_name, r.rating
     FROM ratings r
     JOIN users u ON r.user_id = u.id
     WHERE r.store_id = ?`,
    [storeId],
    callback
  );
};

module.exports = {
  getRatingsByUserId,
  getRatingsByStoreId,
  submitRating,
  getAverageRatingByStoreId,
  getRatingsWithUserDetailsByStoreId
};
