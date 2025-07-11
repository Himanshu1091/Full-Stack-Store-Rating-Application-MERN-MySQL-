const db = require('../config/db');

const getAllStores = (callback) => {
  db.query('SELECT * FROM stores', callback);
};

const getStoreById = (id, callback) => {
  db.query('SELECT * FROM stores WHERE id = ?', [id], callback);
};

const getStoresByOwnerId = (ownerId, callback) => {
  db.query(
    'SELECT id, name, address FROM stores WHERE owner_id = ?',
    [ownerId],
    callback
  );
};

const createStore = (storeData, callback) => {
  const { name, address, owner_id } = storeData;
  db.query(
    'INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)',
    [name, address, owner_id],
    callback
  );
};

module.exports = {
  getAllStores,
  getStoreById,
  getStoresByOwnerId,
  createStore,
};
