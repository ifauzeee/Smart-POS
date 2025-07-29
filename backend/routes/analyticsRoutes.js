const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { getValidDateRange } = require('../utils/dateUtils');

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Memerlukan peran admin." });
    }
    next();
};

// ENDPOINT STATS (Total Pendapatan, Transaksi, Laba, dll.)
router.get('/stats', protect, isAdmin, async (req, res) => {
    try {
        console.log('Received date range:', req.query.startDate, req.query.endDate);
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        
        console.log('Validated date range:', startDate, endDate);
        
        if (!req.user || !req.user.business_id) {
            console.error('Missing business_id in user object');
            return res.status(400).json({ message: 'Invalid business ID' });
        }
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: "Invalid date range provided",
                startDate: req.query.startDate,
                endDate: req.query.endDate
            });
        }
        const businessId = req.user.business_id;
        
        // Menggunakan COALESCE untuk memastikan nilai 0 jika tidak ada data
        const statsQuery = `
            SELECT
                (SELECT CAST(COALESCE(SUM(total_amount), 0) AS DECIMAL(15,2)) FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?) as totalRevenue,
                (SELECT COUNT(id) FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?) as totalTransactions,
                CAST(
                    COALESCE(
                        (SELECT SUM((oi.price - COALESCE(oi.cost_price, 0)) * oi.quantity)
                        FROM order_items oi
                        JOIN orders o2 ON oi.order_id = o2.id
                        WHERE o2.business_id = ? AND o2.created_at BETWEEN ? AND ?)
                    , 0)
                AS DECIMAL(15,2)) as totalProfit,
                COALESCE((
                    SELECT SUM(oi.quantity)
                    FROM order_items oi
                    JOIN orders o2 ON oi.order_id = o2.id
                    WHERE o2.business_id = ? AND o2.created_at BETWEEN ? AND ?
                ), 0) as totalSoldUnits,
                (SELECT COALESCE(COUNT(id), 0) FROM customers WHERE business_id = ? AND created_at BETWEEN ? AND ?) as newCustomers,
                (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE business_id = ? AND created_at BETWEEN ? AND ?) as totalExpenses
        `;

        const [[stats]] = await db.query(statsQuery, [
            businessId, startDate, endDate, // for totalRevenue
            businessId, startDate, endDate, // for totalTransactions
            businessId, startDate, endDate, // for totalProfit
            businessId, startDate, endDate, // for totalSoldUnits
            businessId, startDate, endDate, // for newCustomers
            businessId, startDate, endDate  // for totalExpenses
        ]);

        // Transform numeric strings to numbers
        const transformedStats = {
            totalRevenue: Number(stats.totalRevenue),
            totalTransactions: Number(stats.totalTransactions),
            totalProfit: Number(stats.totalProfit),
            totalSoldUnits: Number(stats.totalSoldUnits),
            newCustomers: Number(stats.newCustomers),
            totalExpenses: Number(stats.totalExpenses),
        };

        res.json(transformedStats);

    } catch (error) {
        console.error("Error fetching stats:", error);
        console.error("Query params:", { businessId: req.user ? req.user.business_id : 'N/A', startDate: req.query.startDate, endDate: req.query.endDate });
        res.status(500).json({ 
            message: "Failed to fetch stats data.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ENDPOINT GRAFIK PENJUALAN HARIAN
router.get('/daily-sales', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const dailySalesQuery = `
            WITH RECURSIVE dates AS (
                SELECT ? as date
                UNION ALL
                SELECT DATE_ADD(date, INTERVAL 1 DAY)
                FROM dates
                WHERE date < ?
            )
            SELECT 
                dates.date,
                COALESCE(SUM(o.total_amount), 0) as sales
            FROM dates
            LEFT JOIN orders o ON DATE(o.created_at) = dates.date AND o.business_id = ?
            GROUP BY dates.date
            ORDER BY date ASC
        `;
        const [dailySales] = await db.query(dailySalesQuery, [startDate, endDate, businessId]);
        
        const formattedSales = dailySales.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        }));
        res.json(formattedSales);

    } catch (error) {
        console.error("Error fetching daily sales:", error);
        res.status(500).json({ message: "Failed to fetch daily sales data." });
    }
});

// ENDPOINT PRODUK TERLARIS (by quantity sold - for TopProductsChart)
router.get('/top-products', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const topProductsQuery = `
            SELECT 
                p.name,
                COALESCE(SUM(oi.quantity), 0) as totalSold,
                p.id as product_id,
                p.stock as current_stock,
                GROUP_CONCAT(DISTINCT pv.name) as variants
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE p.business_id = ?
            AND o.business_id = ? AND o.created_at BETWEEN ? AND ?
            GROUP BY p.name, p.id, p.stock
            ORDER BY totalSold DESC
            LIMIT 5
        `;
        const [topProducts] = await db.query(topProductsQuery, [businessId, businessId, startDate, endDate]);
        res.json(topProducts);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ message: "Failed to fetch top products data.", error: error.message, stack: error.stack });
    }
});

// ENDPOINT: MENGAMBIL PERFORMA PENJUALAN SEMUA PRODUK (Product Sales Performance - for TopProductsChart)
router.get('/product-sales-performance', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const query = `
            SELECT
                p.id,
                p.name,
                COALESCE(SUM(oi.quantity), 0) as totalSold
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id AND oi.order_id IN (
                SELECT id FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?
            )
            WHERE p.business_id = ?
            GROUP BY p.id, p.name
            ORDER BY totalSold DESC, p.name ASC;
        `;
        
        const [productPerformance] = await db.query(query, [businessId, startDate, endDate, businessId]);
        res.json(productPerformance);
    } catch (error) {
        console.error("Error fetching product sales performance:", error);
        res.status(500).json({ message: "Failed to fetch product sales performance." });
    }
});

// ENDPOINT: Performa Kasir (Cashier Performance - for InfoTabs)
router.get('/cashier-performance', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const query = `
            SELECT 
                u.id, 
                u.name, 
                COALESCE(COUNT(o.id), 0) as totalTransactions,
                COALESCE(SUM(o.total_amount), 0) as totalSales
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id AND o.business_id = u.business_id AND o.created_at BETWEEN ? AND ?
            WHERE u.business_id = ?
            GROUP BY u.id, u.name
            ORDER BY totalSales DESC
        `;
        const [cashierPerformance] = await db.query(query, [startDate, endDate, businessId]);
        res.json(cashierPerformance);
    } catch (error) {
        console.error("Error fetching cashier performance:", error);
        res.status(500).json({ message: "Failed to fetch cashier performance." });
    }
});

// ENDPOINT: GET /api/analytics/notifications (for NotificationsPanel)
router.get('/notifications', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const notifications = [];

        // Removed Notifikasi Stok Rendah and Notifikasi Stok Habis queries
        // As per request, this feature is removed.

        res.json(notifications);

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});

// ENDPOINT: STOCK INFO (for InfoTabs product stock list)
router.get('/stock-info', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [products] = await db.query(
            `SELECT p.id, p.name, p.stock, p.image_url 
            FROM products p
             WHERE p.business_id = ?
             ORDER BY p.stock ASC, p.name ASC`,
            [businessId]
        );
        res.json(products);
    } catch (error) {
        console.error("Failed to fetch all product stock info", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ENDPOINT: Get Stale Products (produk tidak laku - for InfoTabs)
router.get('/stale-products', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const days = parseInt(req.query.days) || 30; // Default to 30 days of inactivity

        const query = `
            SELECT 
                p.id, 
                p.name, 
                p.stock, 
                MAX(o.created_at) AS lastSoldDate
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.business_id = p.business_id
            WHERE p.business_id = ? 
            GROUP BY p.id, p.name, p.stock
            HAVING (lastSoldDate IS NULL AND p.stock > 0) OR (DATEDIFF(NOW(), lastSoldDate) > ? AND p.stock > 0)
            ORDER BY lastSoldDate ASC, p.name ASC;
        `;
        const [staleProducts] = await db.query(query, [businessId, days]);
        res.json(staleProducts);
    } catch (error) {
        console.error("Error fetching stale products:", error);
        res.status(500).json({ message: "Failed to fetch stale products data." });
    }
});
// ENDPOINT: Get Expired Products (produk mendekati kadaluarsa atau sudah kadaluarsa - for InfoTabs)
router.get('/expired-products', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const days = parseInt(req.query.days) || 30; // Default to products expiring within 30 days
        
        const query = `
            SELECT 
                id, 
                name, 
                stock, 
                expiration_date
            FROM products 
            WHERE business_id = ? 
            AND expiration_date IS NOT NULL 
            AND expiration_date <= DATE_ADD(NOW(), INTERVAL ? DAY)
            ORDER BY expiration_date ASC;
        `;
        const [expiredProducts] = await db.query(query, [businessId, days]);
        res.json(expiredProducts);
    } catch (error) {
        console.error("Error fetching expired products:", error);
        res.status(500).json({ message: "Failed to fetch expired products data." });
    }
});

// NEW ENDPOINT: Top Customers (Pelanggan Teratas - for InfoTabs)
router.get('/top-customers', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const query = `
            SELECT 
                c.id, 
                c.name, 
                COALESCE(SUM(o.total_amount), 0) as totalSpent,
                COALESCE(COUNT(o.id), 0) as totalOrders
            FROM customers c
            LEFT JOIN orders o ON c.id = o.customer_id AND o.business_id = c.business_id AND o.created_at BETWEEN ? AND ?
            WHERE c.business_id = ?
            GROUP BY c.id, c.name
            ORDER BY totalSpent DESC
            LIMIT 5;
        `;
        const [topCustomers] = await db.query(query, [startDate, endDate, businessId]);
        res.json(topCustomers);
    } catch (error) {
        console.error("Error fetching top customers:", error);
        res.status(500).json({ message: "Failed to fetch top customers data." });
    }
});

// NEW ENDPOINT: Recent Suppliers (Pemasok Terbaru - berdasarkan created_at - for InfoTabs)
router.get('/recent-suppliers', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const limit = parseInt(req.query.limit) || 5;

        const query = `
            SELECT id, name, created_at 
            FROM suppliers 
            WHERE business_id = ?
            ORDER BY created_at DESC
            LIMIT ?;
        `;
        const [recentSuppliers] = await db.query(query, [businessId, limit]);
        res.json(recentSuppliers);
    } catch (error) {
        console.error("Error fetching recent suppliers:", error);
        res.status(500).json({ message: "Failed to fetch recent suppliers data." });
    }
});

// NEW ENDPOINT: Insights (for NotificationsPanel)
router.get('/insights', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const insights = [];

        // Example Insight 1: Check if sales targets are met
        const [[revenueTarget]] = await db.query('SELECT monthly_revenue_target FROM businesses WHERE id = ?', [businessId]);
        const [[currentMonthSales]] = await db.query(
            `SELECT COALESCE(SUM(total_amount), 0) as totalSales FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?`,
            [businessId, startDate, endDate]
        ); // Using filtered date range for current month sales

        if (revenueTarget && revenueTarget.monthly_revenue_target > 0) {
            if (currentMonthSales.totalSales >= revenueTarget.monthly_revenue_target) {
                insights.push({ id: 'insight-sales-target-met', type: 'success', icon: 'FiTrendingUp', text: 'Target pendapatan bulanan tercapai!' });
            } else {
                const remaining = revenueTarget.monthly_revenue_target - currentMonthSales.totalSales;
                if (remaining > 0) {
                    insights.push({ id: 'insight-sales-target-remaining', type: 'info', icon: 'FiBarChart', text: `Perlu Rp ${new Intl.NumberFormat('id-ID').format(remaining)} lagi untuk mencapai target.` });
                }
            }
        }

        // Example Insight 2: High Sales Day
        const [[topDay]] = await db.query(
            `SELECT DATE(created_at) as date, SUM(total_amount) as sales 
            FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at) ORDER BY sales DESC LIMIT 1`,
            [businessId, startDate, endDate]
        );
        if (topDay && topDay.sales > 0) { // Add threshold here if needed
            insights.push({ id: 'insight-high-sales-day', type: 'info', icon: 'FiDollarSign', text: `Hari penjualan tertinggi Anda adalah ${new Date(topDay.date).toLocaleDateString('id-ID')}: Rp ${new Intl.NumberFormat('id-ID').format(topDay.sales)}.` });
        }


        // Example Insight 3: No new customers
        const [[newCustCount]] = await db.query(`SELECT COALESCE(COUNT(id), 0) as count FROM customers WHERE business_id = ? AND created_at BETWEEN ? AND ?`, [businessId, startDate, endDate]);
        if (newCustCount.count === 0) {
            insights.push({ id: 'insight-no-new-customers', type: 'info', icon: 'FiUsers', text: 'Tidak ada pelanggan baru dalam periode ini. Coba program loyalitas!' });
        }

        res.json(insights);
    } catch (error) {
        console.error("Error fetching insights:", error);
        res.status(500).json({ message: "Failed to fetch insights data." });
    }
});

module.exports = router;