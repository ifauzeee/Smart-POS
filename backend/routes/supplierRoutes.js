const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

// GET all suppliers
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [suppliers] = await db.query(
            'SELECT id, name, contact_person, phone, email, address, created_at FROM suppliers WHERE business_id = ? AND is_archived = 0 ORDER BY name ASC',
            [businessId]
        );
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST a new supplier
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;
    try {
        const [result] = await db.query(
            'INSERT INTO suppliers (business_id, name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
            [businessId, name, contact_person || null, phone || null, email || null, address || null]
        );
        const supplierId = result.insertId;
        await logActivity(businessId, userId, 'CREATE_SUPPLIER', `Created supplier: ${name} (ID: ${supplierId}).`);
        res.status(201).json({ message: 'Supplier berhasil dibuat.', supplierId: supplierId });
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT update a supplier
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    const { id } = req.params;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ? AND business_id = ?',
            [name, contact_person || null, phone || null, email || null, address || null, id, businessId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
        }
        res.json({ message: 'Supplier berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE (soft delete) a supplier
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'UPDATE suppliers SET is_archived = 1 WHERE id = ? AND business_id = ?',
            [id, businessId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Supplier tidak ditemukan.' });
        }
        res.json({ message: 'Supplier berhasil diarsipkan.' });
    } catch (error) {
        console.error('Error archiving supplier:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;