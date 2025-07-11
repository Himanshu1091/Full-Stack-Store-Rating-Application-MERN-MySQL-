const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const storeRoutes = require('./routes/storeRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ DB Test
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// ✅ Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', require('./routes/ratingRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
