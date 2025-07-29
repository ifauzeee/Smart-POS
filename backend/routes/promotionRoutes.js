// backend/routes/promotionRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak." });
    }
    next();
};

// GET semua promosi
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const [promotions] = await db.query(
            'SELECT * FROM promotions WHERE business_id = ? ORDER BY created_at DESC',
            [req.user.business_id]
        );
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// POST promosi baru
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, description, type, value, code, start_date, end_date, is_active } = req.body;
    const businessId = req.user.business_id;

    try {
        const [result] = await db.query(
            'INSERT INTO promotions (business_id, name, description, type, value, code, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [businessId, name, description, type, value, code || null, start_date || null, end_date || null, is_active]
        );
        await logActivity(businessId, req.user.id, 'CREATE_PROMOTION', `Membuat promosi: ${name}`);
        res.status(201).json({ message: 'Promosi berhasil dibuat.', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Kode promo sudah digunakan.' });
        }
        res.status(500).json({ message: "Server Error" });
    }
});

// GET validasi kode promo untuk kasir
router.get('/validate/:code', protect, async (req, res) => {
    const { code } = req.params;
    try {
        const query = `
            SELECT * FROM promotions 
            WHERE code = ? AND business_id = ? AND is_active = true 
            AND (start_date IS NULL OR NOW() >= start_date) 
            AND (end_date IS NULL OR NOW() <= end_date)
        `;
        const [[promotion]] = await db.query(query, [code, req.user.business_id]);

        if (!promotion) {
            return res.status(404).json({ message: 'Kode promo tidak valid atau sudah kedaluwarsa.' });
        }
        res.json(promotion);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE promosi
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM promotions WHERE id = ? AND business_id = ?',
            [req.params.id, req.user.business_id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan.' });
        }
        await logActivity(req.user.business_id, req.user.id, 'DELETE_PROMOTION', `Menghapus promosi ID: ${req.params.id}`);
        res.json({ message: 'Promosi berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;