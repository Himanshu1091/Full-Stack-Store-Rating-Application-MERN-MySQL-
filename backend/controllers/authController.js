const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// ✅ Register
const register = (req, res) => {
  const { name, email, address, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    userModel.createUser({ name, email, address, password: hash, role }, (err, result) => {
      if (err) return res.status(500).json({ message: 'Error creating user', error: err });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

// ✅ Login
const login = (req, res) => {
  const { email, password } = req.body;

  userModel.getUserByEmail(email, (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
  });
};

module.exports = {
  register,
  login,
};
