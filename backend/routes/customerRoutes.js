// C:\Users\Ibnu\Project\smart-pos\backend\routes\customerRoutes.js

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

// MENGGANTI SEMUA 'phone_number' dengan 'phone'
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
    try {
        const [[customer]] = await db.query('SELECT * FROM customers WHERE id = ? AND business_id = ?', [customerId, businessId]);
        if (!customer) return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.get('/:id/history', protect, async (req, res) => {
    const customerId = req.params.id;
    const businessId = req.user.business_id;
    try {
        // PERBAIKAN: Tambahkan 'o.points_earned' ke dalam SELECT dan GROUP BY
        const query = `
            SELECT 
                o.id, 
                o.created_at, 
                o.total_amount, 
                o.points_earned, 
                COUNT(oi.id) as item_count
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = ? AND o.business_id = ?
            GROUP BY o.id, o.created_at, o.total_amount, o.points_earned
            ORDER BY o.created_at DESC`;
        const [history] = await db.query(query, [customerId, businessId]);
        res.json(history);
    } catch (error) {
        console.error("Error fetching customer history:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/', protect, isAdmin, customerValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, phone, email, address } = req.body;
    const { business_id: businessId, id: userId } = req.user;
    try {
        const [result] = await db.query(
            'INSERT INTO customers (business_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
            [businessId, name, phone || null, email || null, address || null]
        );
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
        const [result] = await db.query(
            'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ? AND business_id = ?',
            [name, phone || null, email || null, address || null, customerId, businessId]
        );
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
    res.status(501).json({ message: 'Fitur redeem poin belum diimplementasikan.' });
});

module.exports = router;