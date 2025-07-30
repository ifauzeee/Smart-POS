const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

// Middleware untuk memastikan hanya admin yang bisa akses
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak." });
    }
    next();
};

// GET /api/raw-materials - Mengambil semua bahan baku
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [materials] = await db.query(
            'SELECT * FROM raw_materials WHERE business_id = ? ORDER BY name ASC',
            [businessId]
        );
        res.json(materials);
    } catch (error) {
        console.error('Error fetching raw materials:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/raw-materials - Membuat bahan baku baru
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, stock_quantity, unit, cost_per_unit } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!name || !unit || stock_quantity == null || cost_per_unit == null) {
        return res.status(400).json({ message: 'Nama, kuantitas, unit, dan harga beli per unit harus diisi.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO raw_materials (business_id, name, stock_quantity, unit, cost_per_unit) VALUES (?, ?, ?, ?, ?)',
            [businessId, name, stock_quantity, unit, cost_per_unit]
        );
        const materialId = result.insertId;
        await logActivity(businessId, userId, 'CREATE_RAW_MATERIAL', `Membuat bahan baku: ${name} (ID: ${materialId}).`);
        res.status(201).json({ message: 'Bahan baku berhasil ditambahkan!', materialId });
    } catch (error) {
        console.error('Error creating raw material:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/raw-materials/:id - Memperbarui bahan baku
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, stock_quantity, unit, cost_per_unit } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!name || !unit || stock_quantity == null || cost_per_unit == null) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE raw_materials SET name = ?, stock_quantity = ?, unit = ?, cost_per_unit = ? WHERE id = ? AND business_id = ?',
            [name, stock_quantity, unit, cost_per_unit, id, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bahan baku tidak ditemukan.' });
        }
        await logActivity(businessId, userId, 'UPDATE_RAW_MATERIAL', `Memperbarui bahan baku: ${name} (ID: ${id}).`);
        res.json({ message: 'Bahan baku berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating raw material:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/raw-materials/:id - Menghapus bahan baku
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Periksa apakah bahan baku ini digunakan di resep
        const [[inRecipe]] = await db.query('SELECT COUNT(*) as count FROM recipes WHERE raw_material_id = ?', [id]);
        if (inRecipe.count > 0) {
            return res.status(400).json({ message: 'Bahan baku tidak bisa dihapus karena masih digunakan dalam resep produk.' });
        }

        const [result] = await db.query(
            'DELETE FROM raw_materials WHERE id = ? AND business_id = ?',
            [id, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Bahan baku tidak ditemukan.' });
        }
        await logActivity(businessId, userId, 'DELETE_RAW_MATERIAL', `Menghapus bahan baku ID: ${id}.`);
        res.json({ message: 'Bahan baku berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting raw material:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;