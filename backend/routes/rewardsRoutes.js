// C:\Users\Ibnu\Project\smart-pos\backend\routes\rewardsRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');

const router = express.Router();

// GET /api/rewards - Mendapatkan semua hadiah aktif
router.get('/', protect, async (req, res) => {
    const businessId = req.user.business_id;
    try {
        const [rewards] = await db.query(
            'SELECT * FROM rewards WHERE business_id = ? AND is_active = TRUE ORDER BY points_cost ASC',
            [businessId]
        );
        res.json(rewards);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat hadiah.', error: error.message });
    }
});

// POST /api/rewards - Membuat hadiah baru (Admin)
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, description, points_cost, is_active } = req.body;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'INSERT INTO rewards (business_id, name, description, points_cost, is_active) VALUES (?, ?, ?, ?, ?)',
            [businessId, name, description, points_cost, is_active]
        );
        await logActivity(businessId, req.user.id, 'CREATE_REWARD', `Membuat hadiah: ${name}`);
        res.status(201).json({ message: 'Hadiah berhasil dibuat.', rewardId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat hadiah.', error: error.message });
    }
});

// PUT /api/rewards/:id - Memperbarui hadiah (Admin)
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, points_cost, is_active } = req.body;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'UPDATE rewards SET name = ?, description = ?, points_cost = ?, is_active = ? WHERE id = ? AND business_id = ?',
            [name, description, points_cost, is_active, id, businessId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Hadiah tidak ditemukan.' });
        await logActivity(businessId, req.user.id, 'UPDATE_REWARD', `Memperbarui hadiah: ${name}`);
        res.json({ message: 'Hadiah berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui hadiah.', error: error.message });
    }
});

// DELETE /api/rewards/:id - Menghapus hadiah (Admin)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query('DELETE FROM rewards WHERE id = ? AND business_id = ?', [id, businessId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Hadiah tidak ditemukan.' });
        await logActivity(businessId, req.user.id, 'DELETE_REWARD', `Menghapus hadiah ID: ${id}`);
        res.json({ message: 'Hadiah berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus hadiah.', error: error.message });
    }
});

module.exports = router;