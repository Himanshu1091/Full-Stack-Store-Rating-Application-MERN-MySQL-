// AdminDashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchAllUsers,
  fetchAllStores,
  createStore,
  register,
  fetchRatingsForStore,
  changePassword,
} from '../services/authService';
import { jwtDecode } from 'jwt-decode';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [userFormErrors, setUserFormErrors] = useState({});

  const [storeForm, setStoreForm] = useState({ name: '', address: '', owner_id: '' });
  const [storeFormErrors, setStoreFormErrors] = useState({});

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  const [userSort, setUserSort] = useState({ field: '', order: 'asc' });
  const [storeSort, setStoreSort] = useState({ field: '', order: 'asc' });

  const token = localStorage.getItem('token');
  const currentUserId = jwtDecode(token).id;

  const loadData = useCallback(async () => {
    try {
      const [uRes, sRes] = await Promise.all([fetchAllUsers(token), fetchAllStores(token)]);
      const uList = uRes.data;
      const sList = await Promise.all(
        sRes.data.map(async store => {
          const { data: ratings } = await fetchRatingsForStore(store.id);
          const avgRating = ratings.length
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 'N/A';
          return { ...store, averageRating: avgRating };
        })
      );

      const userMap = uList.map(u => {
        const rs = sList
          .filter(s => s.owner_id === u.id)
          .map(s => parseFloat(s.averageRating))
          .filter(r => !isNaN(r));
        return {
          ...u,
          averageRating: u.role === 'owner' && rs.length
            ? (rs.reduce((a, b) => a + b) / rs.length).toFixed(1)
            : '—',
        };
      });

      setUsers(userMap);
      setStores(sList);
    } catch {
      setError('Failed loading data');
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetMsgs = () => {
    setError('');
    setMessage('');
  };

  const validateUserForm = () => {
    const errs = {};
    if (!/^[A-Za-z ]{20,40}$/.test(userForm.name.trim())) errs.name = 'Name must be 20–40 letters/spaces.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) errs.email = 'Valid email required.';
    if (userForm.address.trim().length < 5) errs.address = 'Address must be at least 5 characters.';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}/.test(userForm.password))
      errs.password = 'Password must be 8+ chars with upper, lower, number & special.';
    return errs;
  };

  const validateStoreForm = () => {
    const errs = {};
    if (!/^[A-Za-z ]{6,40}$/.test(storeForm.name.trim())) errs.name = 'Store name must be 6–40 letters/spaces.';
    if (storeForm.address.trim().length < 5) errs.address = 'Address must be at least 5 characters.';
    if (!storeForm.owner_id) errs.owner_id = 'Owner selection is required.';
    return errs;
  };

  const handleUserSubmit = async e => {
    e.preventDefault();
    resetMsgs();
    const errs = validateUserForm();
    if (Object.keys(errs).length) {
      setUserFormErrors(errs);
      return;
    }
    try {
      await register(userForm);
      setMessage('User added!');
      setUserForm({ name: '', email: '', password: '', address: '', role: 'user' });
      setUserFormErrors({});
      loadData();
    } catch {
      setError('User save failed');
    }
  };

  const handleStoreSubmit = async e => {
    e.preventDefault();
    resetMsgs();
    const errs = validateStoreForm();
    if (Object.keys(errs).length) {
      setStoreFormErrors(errs);
      return;
    }
    try {
      await createStore(storeForm, token);
      setMessage('Store added!');
      setStoreForm({ name: '', address: '', owner_id: '' });
      setStoreFormErrors({});
      loadData();
    } catch {
      setError('Store save failed');
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      await changePassword(currentUserId, passwordForm.currentPassword, passwordForm.newPassword, token);
      setPasswordMessage('Password changed!');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch {
      setPasswordMessage('Failed to change password. Check your current password.');
    }
  };

  const sortData = (data, field, order) =>
    [...data].sort((a, b) => {
      const va = a[field]?.toString().toLowerCase() || '';
      const vb = b[field]?.toString().toLowerCase() || '';
      return order === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const handleUserSort = field => {
    const order = userSort.field === field && userSort.order === 'asc' ? 'desc' : 'asc';
    setUserSort({ field, order });
    setUsers(prev => sortData(prev, field, order));
  };

  const handleStoreSort = field => {
    const order = storeSort.field === field && storeSort.order === 'asc' ? 'desc' : 'asc';
    setStoreSort({ field, order });
    setStores(prev => sortData(prev, field, order));
  };

  const renderSortIcon = (field, cur) => (cur.field !== field ? '⇅' : cur.order === 'asc' ? '↑' : '↓');

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="text-primary fw-semibold">🛡️ Admin Dashboard</h2>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary fw-semibold"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
          <button
            className="btn btn-sm btn-outline-danger fw-semibold"
            onClick={() => {
              localStorage.removeItem('token');
              window.location = '/';
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Success & Error Feedback */}
      {message && <div className="alert alert-success py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Change Password Form */}
      {showPasswordForm && (
        <div
          className="card mb-4 p-4 shadow-sm rounded-4 border"
          style={{
            maxWidth: 400,
            backgroundColor: '#fff',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          <h5 className="fw-bold text-dark mb-3">🔐 Change Password</h5>

          {passwordMessage && (
            <div
              className={`alert ${passwordMessage.includes('changed') ? 'alert-success' : 'alert-danger'
                } py-2`}
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
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                required
              />
            </div>
            <button className="btn btn-primary w-100 fw-semibold">Update Password</button>
          </form>
        </div>
      )}

      {/* Add User */}
      <div
        className="card mb-4 p-4 shadow-sm rounded-4 border"
        style={{
          maxWidth: 600,
          fontFamily: 'Poppins, sans-serif',
          backgroundColor: '#fff',
        }}
      >
        <h5 className="fw-bold mb-3 text-dark">👥 Add New User</h5>

        <form onSubmit={handleUserSubmit} className="row g-3">
          {['name', 'email', 'address', 'password'].map((field) => (
            <div className="col-md" key={field}>
              <label className="form-label fw-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={
                  field === 'email'
                    ? 'email'
                    : field === 'password'
                      ? 'password'
                      : 'text'
                }
                placeholder={`Enter ${field}`}
                className={`form-control ${userFormErrors[field] ? 'is-invalid' : ''}`}
                value={userForm[field]}
                onChange={(e) => {
                  setUserForm({ ...userForm, [field]: e.target.value });
                  if (userFormErrors[field]) {
                    setUserFormErrors((prev) => ({ ...prev, [field]: '' }));
                  }
                }}
                required
              />
              {userFormErrors[field] && (
                <div className="invalid-feedback">{userFormErrors[field]}</div>
              )}
            </div>
          ))}

          <div className="col-md">
            <label className="form-label fw-medium">Role</label>
            <select
              className="form-select"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-auto d-flex align-items-end">
            <button className="btn btn-success px-4 fw-semibold">Add</button>
          </div>
        </form>
      </div>
      {/* Users Table */}
      <input
        className="form-control form-control-sm mb-3"
        placeholder="🔍 Search users..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value.toLowerCase())}
        style={{ maxWidth: 400 }}
      />

      <div className="card mb-4 shadow-sm rounded-4 border">
        <div className="card-header fw-semibold bg-light text-dark">
          👤 Users List
        </div>
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead className="table-dark">
              <tr>
                {['id', 'name', 'email', 'address', 'role'].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleUserSort(col)}
                    style={{ cursor: 'pointer' }}
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}{' '}
                    {renderSortIcon(col, userSort)}
                  </th>
                ))}
                <th>Avg Store Rating</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(userSearch) ||
                    u.email.toLowerCase().includes(userSearch)
                )
                .map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>
                    <td>
                      <span className="badge bg-secondary text-light">
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.averageRating !== null ? (
                        <span className="text-warning fw-semibold">
                          ⭐ {u.averageRating}
                        </span>
                      ) : (
                        <span className="text-muted fst-italic">No ratings</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Store */}
      <div
        className="card mb-4 p-4 shadow-sm rounded-4 border"
        style={{
          maxWidth: 600,
          backgroundColor: '#fff',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h5 className="fw-bold mb-3 text-dark">🏬 Add New Store</h5>

        <form onSubmit={handleStoreSubmit} className="row g-3">
          {['name', 'address'].map((field) => (
            <div className="col-md" key={field}>
              <label className="form-label fw-medium">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                placeholder={`Enter ${field}`}
                className={`form-control ${storeFormErrors[field] ? 'is-invalid' : ''}`}
                value={storeForm[field]}
                onChange={(e) => {
                  setStoreForm({ ...storeForm, [field]: e.target.value });
                  if (storeFormErrors[field]) {
                    setStoreFormErrors((prev) => ({ ...prev, [field]: '' }));
                  }
                }}
                required
              />
              {storeFormErrors[field] && (
                <div className="invalid-feedback">{storeFormErrors[field]}</div>
              )}
            </div>
          ))}

          <div className="col-md">
            <label className="form-label fw-medium">Select Owner</label>
            <select
              className={`form-select ${storeFormErrors.owner_id ? 'is-invalid' : ''}`}
              value={storeForm.owner_id}
              onChange={(e) => {
                setStoreForm({ ...storeForm, owner_id: e.target.value });
                if (storeFormErrors.owner_id) {
                  setStoreFormErrors((prev) => ({ ...prev, owner_id: '' }));
                }
              }}
              required
            >
              <option value="">Select Owner</option>
              {users
                .filter((u) => u.role === 'owner')
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </select>
            {storeFormErrors.owner_id && (
              <div className="invalid-feedback">{storeFormErrors.owner_id}</div>
            )}
          </div>

          <div className="col-auto d-flex align-items-end">
            <button className="btn btn-success px-4 fw-semibold">Add Store</button>
          </div>
        </form>
      </div>

      {/* Stores Table */}
      <input
        className="form-control form-control-sm mb-3"
        placeholder="🔍 Search stores..."
        value={storeSearch}
        onChange={(e) => setStoreSearch(e.target.value.toLowerCase())}
        style={{ maxWidth: 400, fontFamily: 'Poppins, sans-serif' }}
      />

      <div className="card shadow-sm rounded-4 border">
        <div className="card-header fw-semibold bg-light text-dark">🏬 Stores</div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th onClick={() => handleStoreSort('id')} style={{ cursor: 'pointer' }}>
                  ID {renderSortIcon('id', storeSort)}
                </th>
                <th onClick={() => handleStoreSort('name')} style={{ cursor: 'pointer' }}>
                  Name {renderSortIcon('name', storeSort)}
                </th>
                <th onClick={() => handleStoreSort('address')} style={{ cursor: 'pointer' }}>
                  Address {renderSortIcon('address', storeSort)}
                </th>
                <th>Owner Name</th>
                <th>Owner Email</th>
                <th onClick={() => handleStoreSort('averageRating')} style={{ cursor: 'pointer' }}>
                  Avg Rating {renderSortIcon('averageRating', storeSort)}
                </th>
              </tr>
            </thead>
            <tbody>
              {stores
                .filter(
                  (s) =>
                    s.name.toLowerCase().includes(storeSearch) ||
                    s.address.toLowerCase().includes(storeSearch)
                )
                .map((s) => {
                  const owner = users.find((u) => u.id === s.owner_id) || {};
                  return (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.address}</td>
                      <td>{owner.name || '—'}</td>
                      <td>{owner.email || '—'}</td>
                      <td>
                        {s.averageRating !== null ? (
                          <span className="text-warning fw-semibold">⭐ {s.averageRating}</span>
                        ) : (
                          <span className="text-muted fst-italic">No ratings</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div><br /><br />
    </div>
  );
}
export default AdminDashboard;
