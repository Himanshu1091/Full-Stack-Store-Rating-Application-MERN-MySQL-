import React, { useEffect, useState, useCallback } from 'react';
import { fetchMyStores, createStore } from '../services/authService';
import axios from 'axios';

function StoreOwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({ name: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [ratingsByStore, setRatingsByStore] = useState({});
  const token = localStorage.getItem('token');

  const loadStores = useCallback(async () => {
    try {
      const res = await fetchMyStores(token);
      const storesData = res.data;
      setStores(storesData);

      const ratingsMap = {};
      for (const store of storesData) {
        const response = await axios.get(`http://localhost:5000/api/ratings/store/${store.id}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        ratingsMap[store.id] = response.data;
      }
      setRatingsByStore(ratingsMap);
    } catch (err) {
      console.error(err);
      setError('Failed to load your stores or ratings.');
    }
  }, [token]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
  };

  const validateStoreForm = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z ]{6,40}$/;

    if (!form.name.trim()) {
      errors.name = 'Store name is required.';
    } else if (!nameRegex.test(form.name.trim())) {
      errors.name = 'Name must be at least 6 characters and only letters/spaces.';
    }

    if (!form.address.trim()) {
      errors.address = 'Address is required.';
    } else if (form.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters.';
    }

    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    if (!passwordForm.oldPassword.trim()) {
      errors.oldPassword = 'Current password is required.';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required.';
    } else if (!passwordRegex.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must be at least 8 chars, include uppercase, lowercase, number, and special char.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const errors = validateStoreForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await createStore(form, token);
      setMessage('Store created successfully!');
      setForm({ name: '', address: '' });
      setFormErrors({});
      loadStores();
    } catch (err) {
      setError('Error creating store.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      await axios.put(
        'http://localhost:5000/api/users/change-password',
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPasswordMessage('Password updated successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '' });
      setPasswordErrors({});
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordMessage('Failed to update password. Please check your current password.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary">Store Owner Dashboard</h2>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
          <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
            Logout
          </button>
        </div>
      </div>

      {/* Change Password Form */}
      {showPasswordForm && (
        <div className="card mb-3 p-3 shadow-sm" style={{ maxWidth: 400 }}>
          <h5>Change Password</h5>
          {passwordMessage && (
            <div className={`alert ${passwordMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
              {passwordMessage}
            </div>
          )}
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-2">
              <input
                type="password"
                className={`form-control ${passwordErrors.oldPassword ? 'is-invalid' : ''}`}
                name="oldPassword"
                placeholder="Current Password"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                required
              />
              {passwordErrors.oldPassword && (
                <div className="invalid-feedback">{passwordErrors.oldPassword}</div>
              )}
            </div>
            <div className="mb-2">
              <input
                type="password"
                className={`form-control ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                name="newPassword"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
              {passwordErrors.newPassword && (
                <div className="invalid-feedback">{passwordErrors.newPassword}</div>
              )}
            </div>
            <button className="btn btn-primary btn-sm">Update Password</button>
          </form>
        </div>
      )}

      {/* Add Store Form */}
<div
  className="card mb-4 p-4 shadow-sm rounded-4 border"
  style={{
    maxWidth: 600,
    backgroundColor: '#fff',
    fontFamily: 'Poppins, sans-serif',
  }}
>
  <h5 className="fw-bold text-dark mb-3">🏬 Add New Store</h5>

  {message && <div className="alert alert-success py-2">{message}</div>}
  {error && <div className="alert alert-danger py-2">{error}</div>}

  <form onSubmit={handleSubmit} className="row g-3">
    <div className="col-md">
      <label className="form-label fw-medium">Store Name</label>
      <input
        type="text"
        name="name"
        placeholder="Enter store name"
        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
        value={form.name}
        onChange={handleChange}
        required
      />
      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
    </div>

    <div className="col-md">
      <label className="form-label fw-medium">Address</label>
      <input
        type="text"
        name="address"
        placeholder="Enter address"
        className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
        value={form.address}
        onChange={handleChange}
        required
      />
      {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
    </div>

    <div className="col-auto d-flex align-items-end">
      <button className="btn btn-success px-4 fw-semibold">Add</button>
    </div>
  </form>
</div>

      {/* Store List */}
      <h5>Your Stores</h5>
      {stores.length === 0 ? (
        <p className="text-muted">No stores yet.</p>
      ) : (
        stores.map((store) => (
          <div key={store.id} className="card mb-3 p-3 shadow-sm">
            <h6>{store.name}</h6>
            <p className="mb-1"><strong>Address:</strong> {store.address}</p>

            <h6 className="mt-2">Users who rated this store:</h6>
            {ratingsByStore[store.id]?.length > 0 ? (
              <ul className="mb-0">
                {ratingsByStore[store.id].map((rater) => (
                  <li key={rater.user_id}>
                    {rater.user_name || 'Unknown'} - ⭐ {rater.rating}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No ratings yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default StoreOwnerDashboard;
