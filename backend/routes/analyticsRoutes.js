const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Endpoint untuk mendapatkan produk dengan stok menipis
router.get('/low-stock', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    try {
        const query = `
            SELECT id, name, stock, low_stock_threshold
            FROM products
            WHERE stock <= low_stock_threshold AND stock > 0
            ORDER BY stock ASC
        `;
        const [products] = await db.query(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Endpoint summary dashboard
router.get('/summary', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrdersQuery = `SELECT total_amount, created_at FROM orders WHERE created_at >= ?`;
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

        const timeZone = 'Asia/Jakarta';
        const todayString = new Date().toLocaleDateString('en-CA', { timeZone });
        let todayRevenue = 0;
        let todayTransactions = 0;
        
        const salesLast7DaysMap = new Map();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateString = d.toLocaleDateString('en-CA', { timeZone });
            salesLast7DaysMap.set(dateString, { date: dateString, dailySales: 0 });
        }

        for (const order of recentOrders) {
            const orderDateString = new Date(order.created_at).toLocaleDateString('en-CA', { timeZone });
            if (orderDateString === todayString) {
                todayRevenue += parseFloat(order.total_amount);
                todayTransactions++;
            }
            if (salesLast7DaysMap.has(orderDateString)) {
                salesLast7DaysMap.get(orderDateString).dailySales += parseFloat(order.total_amount);
            }
        }
        
        const salesLast7Days = Array.from(salesLast7DaysMap.values());

        res.json({
            todayRevenue,
            todayTransactions,
            topProducts: topProductsResult,
            salesLast7Days
        });

    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;