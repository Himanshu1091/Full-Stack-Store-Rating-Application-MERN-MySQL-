// src/pages/StoreListPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StoreCard from '../components/StoreCard';

function StoreListPage() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/stores').then((res) => {
      setStores(res.data);
    });
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">All Stores</h2>
      {stores.length === 0 ? (
        <p>No stores available.</p>
      ) : (
        stores.map((store) => <StoreCard key={store.id} store={store} />)
      )}
    </div>
  );
}

export default StoreListPage;
