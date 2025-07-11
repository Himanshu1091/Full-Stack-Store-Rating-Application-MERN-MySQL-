const express = require('express');
const router = express.Router();
const storeModel = require('../models/storeModel');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// 🔓 GET all stores
router.get('/', (req, res) => {
  storeModel.getAllStores((err, stores) => {
    if (err) return res.status(500).json({ error: 'Error fetching stores' });
    res.json(stores);
  });
});

// 🔒 GET stores owned by the logged-in user (owner or admin)
router.get('/my', verifyToken, verifyRole(['owner', 'admin']), (req, res) => {
  const ownerId = req.user.id;
  storeModel.getStoresByOwnerId(ownerId, (err, stores) => {
    if (err) return res.status(500).json({ error: 'Error fetching owner stores' });
    res.json(stores);
  });
});

// 🔓 GET store by ID
router.get('/:id', (req, res) => {
  const storeId = req.params.id;
  storeModel.getStoreById(storeId, (err, store) => {
    if (err) return res.status(500).json({ error: 'Error fetching store' });
    if (store.length === 0) return res.status(404).json({ message: 'Store not found' });
    res.json(store[0]);
  });
});

// 🔒 POST create store (admin or owner only)
router.post('/create', verifyToken, verifyRole(['admin', 'owner']), (req, res) => {
  const { name, address, owner_id } = req.body;

  let storeData;

  if (req.user.role === 'admin') {
    if (!owner_id) {
      return res.status(400).json({ error: 'owner_id is required for admin' });
    }
    storeData = {
      name,
      address,
      owner_id
    };
  } else {
    // If the user is an owner, force the store to be assigned to themselves
    storeData = {
      name,
      address,
      owner_id: req.user.id
    };
  }

  storeModel.createStore(storeData, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error creating store' });
    res.status(201).json({ message: 'Store created successfully' });
  });
});

module.exports = router;
