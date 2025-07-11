const db = require('../config/db');

const getUserByEmail = (email, callback) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], callback);
};

const getUserById = (id, callback) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], callback);
};

const createUser = (userData, callback) => {
  const { name, email, address, password, role } = userData;
  db.query(
    'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, address, password, role],
    callback
  );
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
};
