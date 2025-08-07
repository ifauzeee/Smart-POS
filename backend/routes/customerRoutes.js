const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator');

const router = express.Router();

const customerValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama pelanggan tidak boleh kosong.'),
    body('phone').optional({ checkFalsy: true }).trim(),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email tidak valid.').normalizeEmail(),
    body('address').optional({ checkFalsy: true }).trim()
];

router.get('/', protect, async (req, res) => {
    const { search } = req.query;
    const businessId = req.user.business_id;
    try {
        let query = 'SELECT id, name, phone, email, points FROM customers WHERE business_id = ?';
        const params = [businessId];
        if (search && search.trim() !== '') {
            query += ' AND (name LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY name ASC';
        const [customers] = await db.query(query, params);
        res.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    const customerId = req.params.id;
    const businessId = req.user.business_id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[customer]] = await connection.query('SELECT * FROM customers WHERE id = ? AND business_id = ? FOR UPDATE', [customerId, businessId]);
        if (!customer) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
        }
        const [[correctPointsData]] = await connection.query('SELECT COALESCE(SUM(points_change), 0) as total FROM customer_points_log WHERE customer_id = ?', [customerId]);
        const correctTotalPoints = correctPointsData.total;
        if (customer.points !== correctTotalPoints) {
            await connection.query('UPDATE customers SET points = ? WHERE id = ?', [correctTotalPoints, customerId]);
            customer.points = correctTotalPoints;
            await logActivity(businessId, req.user.id, 'SYNC_POINTS', `Synced points for customer ID ${customerId}. Old: ${customer.points}, New: ${correctTotalPoints}.`);
        }
        await connection.commit();
        res.json(customer);
    } catch (error) {
        await connection.rollback();
        console.error("Error fetching single customer:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// PERBAIKAN DEFINITIF: Menyamakan nama kolom menjadi 'points_change'
router.get('/:id/history', protect, async (req, res) => {
    const customerId = req.params.id;
    const businessId = req.user.business_id;
    try {
        const query = `
            SELECT 
                o.id, 
                o.created_at, 
                o.total_amount, 
                o.points_earned as points_change, -- Nama kolom disamakan
                'Penjualan' as type,
                CONCAT('Transaksi #', o.id) as description
            FROM orders o
            WHERE o.customer_id = ? AND o.business_id = ?

            UNION ALL

            SELECT 
                cpl.id, 
                cpl.created_at,
                0 as total_amount,
                cpl.points_change as points_change, -- Nama kolom disamakan
                'Poin' as type,
                cpl.description
            FROM customer_points_log cpl
            WHERE cpl.customer_id = ? AND cpl.order_id IS NULL

            ORDER BY created_at DESC;
        `;
        const [history] = await db.query(query, [customerId, businessId, customerId]);
        res.json(history);
    } catch (error) {
        console.error("Error fetching customer history:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


router.get('/:id/stats', protect, async (req, res) => {
    const customerId = req.params.id;
    const businessId = req.user.business_id;
    try {
        const statsQuery = `
            SELECT
                (SELECT COUNT(id) FROM orders WHERE customer_id = ? AND business_id = ?) as totalOrders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = ? AND business_id = ?) as totalSpent,
                (SELECT COALESCE(SUM(points_change), 0) FROM customer_points_log WHERE customer_id = ? AND points_change > 0) as totalPointsEarned
        `;
        const [[stats]] = await db.query(statsQuery, [customerId, businessId, customerId, businessId, customerId]);
        const [salesOrders] = await db.query('SELECT total_amount FROM orders WHERE customer_id = ? AND business_id = ? AND total_amount > 0', [customerId, businessId]);
        const totalSalesOrders = salesOrders.length;
        const totalAmountFromSales = salesOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        stats.avgOrderValue = totalSalesOrders > 0 ? totalAmountFromSales / totalSalesOrders : 0;
        res.json(stats);
    } catch (error) {
        console.error("Error fetching customer stats:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/', protect, isAdmin, customerValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, phone, email, address } = req.body;
    const { business_id: businessId, id: userId } = req.user;
    try {
        const [result] = await db.query('INSERT INTO customers (business_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)', [businessId, name, phone || null, email || null, address || null]);
        await logActivity(businessId, userId, 'CREATE_CUSTOMER', `Membuat pelanggan baru: ${name}`);
        res.status(201).json({ message: 'Pelanggan berhasil ditambahkan.', customerId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.put('/:id', protect, isAdmin, customerValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const customerId = req.params.id;
    const { name, phone, email, address } = req.body;
    const { business_id: businessId, id: userId } = req.user;
    try {
        const [result] = await db.query('UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ? AND business_id = ?', [name, phone || null, email || null, address || null, customerId, businessId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
        await logActivity(businessId, userId, 'UPDATE_CUSTOMER', `Memperbarui pelanggan: ${name}`);
        res.json({ message: 'Data pelanggan berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.delete('/:id', protect, isAdmin, async (req, res) => {
    const customerId = req.params.id;
    const { business_id: businessId, id: userId } = req.user;
    try {
        const [result] = await db.query('DELETE FROM customers WHERE id = ? AND business_id = ?', [customerId, businessId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
        await logActivity(businessId, userId, 'DELETE_CUSTOMER', `Menghapus pelanggan ID: ${customerId}`);
        res.json({ message: 'Pelanggan berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/:id/redeem', protect, async (req, res) => {
    const { id: customerId } = req.params;
    const { business_id: businessId, id: userId } = req.user;
    const { pointsToRedeem, description } = req.body;
    const points = Math.abs(parseInt(pointsToRedeem, 10));
    if (!points || points <= 0 || !description) {
        return res.status(400).json({ message: 'Jumlah poin dan deskripsi harus diisi dengan benar.' });
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[customer]] = await connection.query('SELECT points FROM customers WHERE id = ? AND business_id = ? FOR UPDATE', [customerId, businessId]);
        if (!customer) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
        }
        if (customer.points < points) {
            await connection.rollback();
            return res.status(400).json({ message: 'Poin pelanggan tidak mencukupi.' });
        }
        await connection.query('UPDATE customers SET points = points - ? WHERE id = ?', [points, customerId]);
        await connection.query('INSERT INTO customer_points_log (customer_id, points_change, description, user_id) VALUES (?, ?, ?, ?)', [customerId, -points, description, userId]);
        await connection.commit();
        await logActivity(businessId, userId, 'REDEEM_POINTS', `Redeemed ${points} points for customer ID ${customerId}. Reason: ${description}`);
        res.status(200).json({ message: 'Poin berhasil ditukarkan.' });
    } catch (error) {
        await connection.rollback();
        console.error("Error redeeming points:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;