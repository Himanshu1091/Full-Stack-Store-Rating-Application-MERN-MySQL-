import React, { useEffect, useState } from 'react';
import { fetchAllStores } from '../services/authService';
import StoreCard from '../components/StoreCard';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  const token = localStorage.getItem('token');
  const userId = jwtDecode(token).id;

  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await fetchAllStores(token);
        setStores(res.data);
        setFilteredStores(res.data);
      } catch (err) {
        setError('Failed to load stores.');
      }
    };

    loadStores();
  }, [token]);

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(value) ||
        store.address.toLowerCase().includes(value)
    );
    setFilteredStores(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      await axios.put(
        `http://localhost:5000/api/users/${userId}/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordMessage('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordMessage('Failed to update password. Please check your current password.');
    }
  };

  return (
    <div
  className="container mt-4"
  style={{
    fontFamily: 'Poppins, sans-serif',
  }}
>
  {/* Header */}
  <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
    <h2 className="text-primary fw-semibold">👤 User Dashboard</h2>
    <div className="d-flex align-items-center gap-2">
      <input
        type="text"
        className="form-control"
        style={{ width: '250px' }}
        placeholder="🔍 Search by name or address"
        value={search}
        onChange={handleSearchChange}
      />
      <button
        onClick={() => setShowPasswordForm(!showPasswordForm)}
        className="btn btn-sm btn-outline-secondary fw-semibold"
      >
        {showPasswordForm ? 'Cancel' : 'Change Password'}
      </button>
      <button onClick={handleLogout} className="btn btn-sm btn-outline-danger fw-semibold">
        Logout
      </button>
    </div>
  </div>

  {/* Password Form */}
  {showPasswordForm && (
    <div
      className="card mb-4 p-4 shadow-sm rounded-4 border"
      style={{ maxWidth: 400, backgroundColor: '#fff' }}
    >
      <h5 className="fw-bold text-dark mb-3">🔐 Change Password</h5>
      {passwordMessage && (
        <div
          className={`alert ${passwordMessage.includes('success') ? 'alert-success' : 'alert-danger'} py-2`}
        >
          {passwordMessage}
        </div>
      )}
      <form onSubmit={handlePasswordSubmit}>
        <div className="mb-3">
          <label className="form-label fw-medium">Current Password</label>
          <input
            type="password"
            className="form-control"
            name="currentPassword"
            placeholder="Enter current password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-medium">New Password</label>
          <input
            type="password"
            className="form-control"
            name="newPassword"
            placeholder="Enter new password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button className="btn btn-primary w-100 fw-semibold">Update Password</button>
      </form>
    </div>
  )}

  {/* Error Display */}
  {error && <div className="alert alert-danger py-2">{error}</div>}

  {/* Store List */}
  {filteredStores.length === 0 ? (
    <p className="text-muted fst-italic">No matching stores found.</p>
  ) : (
    filteredStores.map((store) => <StoreCard key={store.id} store={store} />)
  )}
</div>
  );
}

export default UserDashboard;
