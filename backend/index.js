require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// --- Konfigurasi CORS Final dan Benar ---
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Akses ditolak oleh kebijakan CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
};

const app = express();

// Aktifkan pre-flight requests SEBELUM middleware lainnya
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Impor semua rute aplikasi
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
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const roleRoutes = require('./routes/roleRoutes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pendaftaran semua rute
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
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/roles', roleRoutes);

app.get('/', (req, res) => res.status(200).send('Smart POS Backend API is running!'));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Backend server running at http://localhost:${port}`));