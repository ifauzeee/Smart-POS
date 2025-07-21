// backend/index.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Import rute
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes'); // <-- TAMBAHKAN INI

// Middleware
app.use(cors());
app.use(express.json());

// Gunakan rute
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes); // <-- TAMBAHKAN INI

// Root endpoint
app.get('/', (req, res) => {
  res.send('🎉 Halo! Ini adalah server backend Smart POS Anda!');
});

// Menjalankan server
app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
});
