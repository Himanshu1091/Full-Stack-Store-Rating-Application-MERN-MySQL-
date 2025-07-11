// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!emailRegex.test(form.email)) newErrors.email = 'Enter a valid email address.';

    if (!form.password.trim()) newErrors.password = 'Password is required.';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', form);
      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === 'admin') navigate('/admin');
      else if (role === 'owner') navigate('/owner');
      else navigate('/user');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div
        className="card shadow-lg p-5 rounded-5 animate__animated animate__fadeIn"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
        }}
      >
        <h2 className="text-center mb-4 text-primary fw-bold">Welcome Back 👋</h2>

        {serverError && <div className="alert alert-danger">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-muted">
          Don’t have an account?{' '}
          <a href="/register" className="text-decoration-none fw-semibold text-primary">
            Register Now
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;