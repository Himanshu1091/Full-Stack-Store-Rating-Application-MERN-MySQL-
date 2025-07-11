// src/components/RatingStars.js
import React from 'react';

function RatingStars({ rating, onRate }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div>
      {stars.map((star) => (
        <i
          key={star}
          className={`bi bi-star-fill mx-1 ${star <= rating ? 'text-warning' : 'text-secondary'}`}
          style={{ cursor: onRate ? 'pointer' : 'default', fontSize: '1.3rem' }}
          onClick={() => onRate && onRate(star)}
        />
      ))}
    </div>
  );
}

export default RatingStars;
