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
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;
        
        if (!businessId) {
            return res.status(400).json({ message: 'Invalid business ID' });
        }
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Invalid date range provided" });
        }
        
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
            businessId, startDate, endDate,
            businessId, startDate, endDate,
            businessId, startDate, endDate,
            businessId, startDate, endDate,
            businessId, startDate, endDate,
            businessId, startDate, endDate
        ]);

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
            sales: parseFloat(item.sales),
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        }));
        res.json(formattedSales);

    } catch (error) {
        console.error("Error fetching daily sales:", error);
        res.status(500).json({ message: "Failed to fetch daily sales data." });
    }
});

// ENDPOINT PRODUK TERLARIS
router.get('/top-products', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const topProductsQuery = `
            SELECT 
                p.name,
                COALESCE(SUM(oi.quantity), 0) as totalSold
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at BETWEEN ? AND ?
            WHERE p.business_id = ? AND p.is_archived = 0
            GROUP BY p.id, p.name
            ORDER BY totalSold DESC
            LIMIT 5
        `;
        const [topProducts] = await db.query(topProductsQuery, [startDate, endDate, businessId]);
        res.json(topProducts);
    } catch (error) {
        console.error("Error fetching top products:", error);
        res.status(500).json({ message: "Failed to fetch top products data." });
    }
});

// ENDPOINT PERFORMA PENJUALAN SEMUA PRODUK
router.get('/product-sales-performance', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const query = `
            SELECT
                p.id, p.name, COALESCE(SUM(oi.quantity), 0) as totalSold
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id AND oi.order_id IN (
                SELECT id FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?
            )
            WHERE p.business_id = ? AND p.is_archived = 0
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

// ENDPOINT Performa Kasir
router.get('/cashier-performance', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const query = `
            SELECT 
                u.id, u.name, 
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

// ENDPOINT: NOTIFIKASI STOK
router.get('/notifications', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        let notifications = [];

        // 1. Notifikasi Stok Habis (stock = 0)
        const [outOfStockProducts] = await db.query(
            `SELECT id, name FROM products WHERE business_id = ? AND stock = 0 AND is_archived = 0`,
            [businessId]
        );
        outOfStockProducts.forEach(p => {
            notifications.push({
                id: `oos-${p.id}`,
                type: 'danger',
                icon: 'FiPackage',
                text: `Stok produk "${p.name}" telah habis.`,
            });
        });

        // 2. Notifikasi Stok Menipis (stock <= low_stock_threshold)
        const [lowStockProducts] = await db.query(
            `SELECT id, name, stock, low_stock_threshold FROM products WHERE business_id = ? AND stock > 0 AND stock <= low_stock_threshold AND is_archived = 0`,
            [businessId]
        );
        lowStockProducts.forEach(p => {
            notifications.push({
                id: `low-${p.id}`,
                type: 'warning',
                icon: 'FiAlertTriangle',
                text: `Stok produk "${p.name}" menipis. Sisa ${p.stock} unit (Batas: ${p.low_stock_threshold}).`,
            });
        });

        res.json(notifications);

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});

// ENDPOINT: STOCK INFO
router.get('/stock-info', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [products] = await db.query(
            `SELECT p.id, p.name, p.stock, p.image_url FROM products p WHERE p.business_id = ? AND p.is_archived = 0 ORDER BY p.stock ASC, p.name ASC`,
            [businessId]
        );
        res.json(products);
    } catch (error) {
        console.error("Failed to fetch all product stock info", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ENDPOINT: Get Stale Products
router.get('/stale-products', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const days = parseInt(req.query.days) || 30;

        const query = `
            SELECT 
                p.id, p.name, p.stock, MAX(o.created_at) AS lastSoldDate
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            LEFT JOIN order_items oi ON pv.id = oi.variant_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.business_id = p.business_id
            WHERE p.business_id = ? AND p.is_archived = 0
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

// ENDPOINT: Get Expired Products
router.get('/expired-products', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const days = parseInt(req.query.days) || 30;
        
        const query = `
            SELECT id, name, stock, expiration_date FROM products 
            WHERE business_id = ? AND expiration_date IS NOT NULL AND expiration_date <= DATE_ADD(NOW(), INTERVAL ? DAY) AND is_archived = 0
            ORDER BY expiration_date ASC;
        `;
        const [expiredProducts] = await db.query(query, [businessId, days]);
        res.json(expiredProducts);
    } catch (error) {
        console.error("Error fetching expired products:", error);
        res.status(500).json({ message: "Failed to fetch expired products data." });
    }
});

// ENDPOINT: Top Customers
router.get('/top-customers', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const query = `
            SELECT 
                c.id, c.name, 
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

// ENDPOINT: Recent Suppliers
router.get('/recent-suppliers', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const limit = parseInt(req.query.limit) || 5;

        const query = `
            SELECT id, name, created_at FROM suppliers 
            WHERE business_id = ? AND is_archived = 0
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

// ENDPOINT: Insights
router.get('/insights', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const insights = [];

        const [[revenueTarget]] = await db.query('SELECT monthly_revenue_target FROM businesses WHERE id = ?', [businessId]);
        const [[currentMonthSales]] = await db.query(
            `SELECT COALESCE(SUM(total_amount), 0) as totalSales FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?`,
            [businessId, startDate, endDate]
        );

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

        const [[topDay]] = await db.query(
            `SELECT DATE(created_at) as date, SUM(total_amount) as sales 
            FROM orders WHERE business_id = ? AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at) ORDER BY sales DESC LIMIT 1`,
            [businessId, startDate, endDate]
        );
        if (topDay && topDay.sales > 0) {
            insights.push({ id: 'insight-high-sales-day', type: 'info', icon: 'FiDollarSign', text: `Hari penjualan tertinggi Anda adalah ${new Date(topDay.date).toLocaleDateString('id-ID')}: Rp ${new Intl.NumberFormat('id-ID').format(topDay.sales)}.` });
        }

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

// ENDPOINT BARU: LAPORAN PROFITABILITAS PRODUK
router.get('/product-profitability', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const profitabilityQuery = `
            SELECT
                p.id,
                p.name,
                COALESCE(SUM(oi.quantity), 0) as total_quantity_sold,
                CAST(COALESCE(SUM(oi.quantity * oi.price), 0) AS DECIMAL(15,2)) as total_revenue,
                CAST(COALESCE(SUM(oi.quantity * oi.cost_price), 0) AS DECIMAL(15,2)) as total_cost,
                CAST(COALESCE(SUM(oi.quantity * (oi.price - oi.cost_price)), 0) AS DECIMAL(15,2)) as total_profit,
                CAST(
                    CASE
                        WHEN SUM(oi.quantity * oi.price) > 0
                        THEN (SUM(oi.quantity * (oi.price - oi.cost_price)) / SUM(oi.quantity * oi.price)) * 100
                        ELSE 0
                    END
                AS DECIMAL(10,2)) as profit_margin_percentage
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.business_id = ? AND o.created_at BETWEEN ? AND ? AND p.is_archived = 0
            GROUP BY p.id, p.name
            ORDER BY total_profit DESC;
        `;

        const [results] = await db.query(profitabilityQuery, [businessId, startDate, endDate]);
        
        // Konversi tipe data agar konsisten
        const formattedResults = results.map(item => ({
            ...item,
            total_quantity_sold: Number(item.total_quantity_sold),
            total_revenue: Number(item.total_revenue),
            total_cost: Number(item.total_cost),
            total_profit: Number(item.total_profit),
            profit_margin_percentage: Number(item.profit_margin_percentage)
        }));

        res.json(formattedResults);

    } catch (error) {
        console.error("Error fetching product profitability:", error);
        res.status(500).json({ message: "Gagal mengambil data profitabilitas produk." });
    }
});

module.exports = router;