const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, async (req, res) => {
    try {
        // 1. Ambil SEMUA data transaksi dari 7 hari terakhir (dalam UTC)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrdersQuery = `
            SELECT id, total_amount, created_at 
            FROM orders 
            WHERE created_at >= ?
        `;
        
        // 2. Query untuk produk terlaris (tidak berubah)
        const topProductsQuery = `
            SELECT p.name, SUM(oi.quantity) as totalSold 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.name 
            ORDER BY totalSold DESC 
            LIMIT 5`;

        const [
            [recentOrders],
            [topProductsResult]
        ] = await Promise.all([
            db.query(recentOrdersQuery, [sevenDaysAgo]),
            db.query(topProductsQuery)
        ]);

        // --- SEMUA LOGIKA SEKARANG DILAKUKAN DI JAVASCRIPT ---
        const timeZone = 'Asia/Jakarta';
        const todayString = new Date().toLocaleDateString('en-CA', { timeZone });
        
        let todayRevenue = 0;
        let todayTransactions = 0;
        
        // Buat struktur data untuk 7 hari terakhir
        const salesLast7DaysMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toLocaleDateString('en-CA', { timeZone });
            salesLast7DaysMap.set(dateString, { date: dateString, dailySales: 0, dailyTransactions: 0 });
        }

        // Proses setiap transaksi yang didapat
        for (const order of recentOrders) {
            const orderDateString = new Date(order.created_at).toLocaleDateString('en-CA', { timeZone });

            // Jika transaksi terjadi hari ini, tambahkan ke total harian
            if (orderDateString === todayString) {
                todayRevenue += parseFloat(order.total_amount);
                todayTransactions++;
            }
            
            // Tambahkan data ke map untuk grafik
            if (salesLast7DaysMap.has(orderDateString)) {
                const dayData = salesLast7DaysMap.get(orderDateString);
                dayData.dailySales += parseFloat(order.total_amount);
            }
        }
        
        const salesLast7Days = Array.from(salesLast7DaysMap.values());

        res.json({
            todayRevenue: todayRevenue,
            todayTransactions: todayTransactions,
            topProducts: topProductsResult,
            salesLast7Days: salesLast7Days
        });

    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;