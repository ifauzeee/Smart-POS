const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint: GET /api/analytics/summary
// Hanya bisa diakses oleh pengguna yang sudah login
router.get('/summary', protect, async (req, res) => {
    try {
        // 1. Query untuk menghitung pendapatan hari ini
        const todayRevenueQuery = `
            SELECT SUM(total_amount) as totalRevenue 
            FROM orders 
            WHERE DATE(created_at) = CURDATE()`;

        // 2. Query untuk menghitung jumlah transaksi hari ini
        const todayTransactionsQuery = `
            SELECT COUNT(id) as totalTransactions 
            FROM orders 
            WHERE DATE(created_at) = CURDATE()`;

        // 3. Query untuk mendapatkan 5 produk terlaris (berdasarkan jumlah terjual)
        const topProductsQuery = `
            SELECT p.name, SUM(oi.quantity) as totalSold 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.name 
            ORDER BY totalSold DESC 
            LIMIT 5`;
        
        // 4. Query untuk mendapatkan total penjualan selama 7 hari terakhir
        const salesLast7DaysQuery = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date, 
                SUM(total_amount) as dailySales 
            FROM orders 
            WHERE created_at >= CURDATE() - INTERVAL 6 DAY
            GROUP BY DATE(created_at) 
            ORDER BY date ASC`;

        // Jalankan semua query secara paralel untuk efisiensi
        const [
            [todayRevenueResult], 
            [todayTransactionsResult],
            [topProductsResult],
            [salesLast7DaysResult]
        ] = await Promise.all([
            db.query(todayRevenueQuery),
            db.query(todayTransactionsQuery),
            db.query(topProductsQuery),
            db.query(salesLast7DaysQuery)
        ]);

        // Kirim semua data yang sudah diolah dalam satu objek JSON
        res.json({
            todayRevenue: todayRevenueResult.totalRevenue || 0,
            todayTransactions: todayTransactionsResult.totalTransactions || 0,
            topProducts: topProductsResult,
            salesLast7Days: salesLast7DaysResult
        });

    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;