const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

// 🔐 Protected admin route - Get all users
router.get('/all', verifyToken, verifyRole('admin'), (req, res) => {
  const db = require('../config/db');
  db.query('SELECT id, name, email, address, role FROM users', (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json(result);
  });
});

// Change password for logged-in user
router.put('/:id/password', verifyToken, async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  const db = require('../config/db');

  try {
    db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });

      if (results.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = results[0];

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed to update password', error: err2 });
        res.json({ message: 'Password updated successfully' });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
