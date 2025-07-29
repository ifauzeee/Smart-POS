// backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import all route files
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();

// Configure CORS to expose the Content-Disposition header
app.use(cors({
    origin: 'http://localhost:5173',
    exposedHeaders: ['Content-Disposition'],
}));

// Middleware to read JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Optional: Basic error handling for body-parser (useful for debugging malformed JSON)
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON:', err.message);
        return res.status(400).send({ message: 'Permintaan tidak valid: JSON salah format.' });
    }
    next();
});
// Middleware to serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register all API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/stock', stockRoutes);

// NEW: Add a basic root route for the backend server
// This helps in testing if the backend server is actually running
app.get('/', (req, res) => {
    res.status(200).send('Smart POS Backend API is running!');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`🚀 Backend server running at http://localhost:${port}`);
});