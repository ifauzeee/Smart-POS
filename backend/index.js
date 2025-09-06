require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

// --- Konfigurasi CORS ---
const allowedOrigins = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti dari Postman atau mobile apps)
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

// --- Middleware Utama ---
app.options('*', cors(corsOptions)); // Handle pre-flight requests
app.use(cors(corsOptions));

// --- Middleware Keamanan: Rate Limiter ---
// Melindungi semua rute API dari serangan brute-force atau spam
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // Batasi setiap IP hingga 100 permintaan per jendela waktu
    message: "Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.",
    standardHeaders: true, // Kirim header RateLimit-* ke client
    legacyHeaders: false, // Nonaktifkan header X-RateLimit-*
});

app.use('/api/', apiLimiter); // Terapkan rate limiter ke semua rute di bawah /api/

// --- Middleware Lainnya ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Impor Rute Aplikasi ---
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
const rewardsRoutes = require('./routes/rewardsRoutes');

// --- Pendaftaran Rute Aplikasi ---
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
app.use('/api/promotions', promotionRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/rewards', rewardsRoutes);

// Rute dasar untuk health check
app.get('/', (req, res) => res.status(200).send('Smart POS Backend API is running!'));

// --- Penanganan Error Terpusat ---
// Middleware ini harus ditempatkan SETELAH semua rute
const errorHandler = (err, req, res, next) => {
    console.error(`[GLOBAL ERROR HANDLER]: ${err.stack}`);
    
    // Default ke 500 jika tidak ada status code spesifik
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message || 'Terjadi kesalahan pada server.',
        // Hanya tampilkan stack trace di mode development untuk keamanan
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

app.use(errorHandler);

// --- Jalankan Server ---
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Backend server running at http://localhost:${port}`));