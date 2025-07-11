// src/services/authService.js
import axios from 'axios';

const API = 'http://localhost:5000/api';

// 🔐 Auth
export const login = (data) => axios.post(`${API}/login`, data);
export const register = (data) => axios.post(`${API}/register`, data);

// 👤 Users
export const fetchAllUsers = (token) =>
  axios.get(`${API}/users/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteUser = (id, token) =>
  axios.delete(`${API}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUser = (id, data, token) =>
  axios.put(`${API}/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const changePassword = (userId, currentPassword, newPassword, token) =>
  axios.put(
    `${API}/users/${userId}/password`,
    { currentPassword, newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// 🏬 Stores
export const fetchMyStores = (token) =>
  axios.get(`${API}/stores/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchAllStores = (token) =>
  axios.get(`${API}/stores`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createStore = (storeData, token) =>
  axios.post(`${API}/stores/create`, storeData, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateStore = (id, data, token) =>
  axios.put(`${API}/stores/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteStore = (id, token) =>
  axios.delete(`${API}/stores/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ⭐ Ratings
export const submitRating = (storeId, rating, token) =>
  axios.post(
    `${API}/ratings/submit`,
    { storeId, rating },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const fetchRatingsForStore = (storeId) =>
  axios.get(`${API}/ratings/store/${storeId}`);