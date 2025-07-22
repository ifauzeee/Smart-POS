require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import semua file rute
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Konfigurasi CORS
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Middleware untuk membaca JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Daftarkan semua alamat API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
});