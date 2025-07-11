// src/pages/RegisterPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = 'Name must contain only letters and spaces.';
    } else if (form.name.trim().length < 20 || form.name.trim().length > 40) {
      newErrors.name = 'Name must be 20 to 40 characters long.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required.';
    } else if (form.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters.';
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(form.password)) {
      newErrors.password =
        'Password must be 8+ chars, include upper, lower, number, special char.';
    }

    if (form.role === 'admin') {
      newErrors.role = 'You cannot register as Admin.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    try {
      await axios.post('http://localhost:5000/api/register', form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(135deg, #edf2f7, #dbe9ff)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div
        className="card py-3 px-4 shadow-lg rounded-5 animate__animated animate__fadeIn"
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#fff',
          border: '1px solid #e5e5e5',
        }}
      >
        <h4 className="text-center mb-3 text-success fw-bold">Create Account ✨</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-2">
            <label className="form-label fw-semibold">Full Name</label>
            <input
              name="name"
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              name="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold">Address</label>
            <input
              name="address"
              type="text"
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
            />
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold">Password</label>
            <input
              name="password"
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold">Role</label>
            <select
              name="role"
              className={`form-select ${errors.role ? 'is-invalid' : ''}`}
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <div className="invalid-feedback">{errors.role}</div>}
          </div>

          <button type="submit" className="btn btn-success w-100 py-2 fw-semibold mt-2">
            Register
          </button>
        </form>

        <p className="text-center mt-3 text-muted mb-0">
          Already have an account?{' '}
          <a href="/" className="text-decoration-none fw-semibold text-success">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;