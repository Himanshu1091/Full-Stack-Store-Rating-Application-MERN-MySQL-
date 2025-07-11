// src/components/StoreCard.js
import React, { useEffect, useState } from 'react';
import RatingStars from './RatingStars';
import { fetchRatingsForStore, submitRating } from '../services/authService';

function StoreCard({ store }) {
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [role, setRole] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadRatings();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRole(payload.role);
    }
    // eslint-disable-next-line
  }, []);

  const loadRatings = async () => {
    try {
      const res = await fetchRatingsForStore(store.id);
      const ratings = res.data;

      if (ratings.length > 0) {
        const avg =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        setAverageRating(avg.toFixed(1));

        if (token) {
          const userId = JSON.parse(atob(token.split('.')[1])).id;
          const userRatingObj = ratings.find((r) => r.user_id === userId);
          if (userRatingObj) setUserRating(userRatingObj.rating);
        }
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error('Failed to load ratings:', err);
      setAverageRating(0);
    }
  };

  const handleRate = async (star) => {
    try {
      await submitRating(store.id, star, token);
      setUserRating(star);
      loadRatings();
    } catch (err) {
      console.error('Rating failed:', err);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title">{store.name}</h5>
        <p className="card-text text-muted">{store.address}</p>

        <div className="d-flex align-items-center justify-content-between">
          <div>
            <strong>Average Rating:</strong> {averageRating} / 5
          </div>

          {/* ⭐ Only normal users can rate */}
          {role === 'user' ? (
            <RatingStars rating={userRating || 0} onRate={handleRate} />
          ) : (
            <span className="text-muted">Login as User to rate</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
