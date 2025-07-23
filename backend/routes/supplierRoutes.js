const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak. Memerlukan peran admin.' });
    }
    next();
};

// GET semua supplier
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name ASC');
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST buat supplier baru
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)',
            [name, contact_person || null, phone || null, email || null, address || null]
        );
        res.status(201).json({ message: 'Supplier berhasil dibuat.', supplierId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT update supplier
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ?',
            [name, contact_person, phone, email, address, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
        res.json({ message: 'Supplier berhasil diperbarui.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE supplier
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        await db.query('UPDATE products SET supplier_id = NULL WHERE supplier_id = ?', [req.params.id]);
        const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
        res.json({ message: 'Supplier berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;