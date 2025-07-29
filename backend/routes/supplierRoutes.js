// FILE: supplierRoutes.js
const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils'); // <-- TAMBAH INI
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak. Memerlukan peran admin.' });
    }
    next();
};

// GET semua supplier berdasarkan business_id
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [suppliers] = await db.query('SELECT id, name, contact_person, phone, email, address, created_at FROM suppliers WHERE business_id = ? ORDER BY name ASC', [businessId]);
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});
// POST buat supplier baru dengan business_id
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'INSERT INTO suppliers (business_id, name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
            [businessId, name, contact_person || null, phone || null, email || null, address || null]
        );
        const supplierId = result.insertId;
        await logActivity(businessId, req.user.id, 'CREATE_SUPPLIER', `Created supplier: ${name} (ID: ${supplierId}).`); // <-- LOG BERHASIL
        res.status(201).json({ message: 'Supplier berhasil dibuat.', supplierId: supplierId });
    } catch (error) {
        console.error('Error creating supplier:', error);
        await logActivity(businessId, req.user.id, 'CREATE_SUPPLIER_FAILED', `Failed to create supplier ${name}. Error: ${error.message}`); // <-- LOG GAGAL
        res.status(500).json({ message: 'Server Error' });
    }
});
// PUT update supplier
router.put('/:id', protect, isAdmin, async (req, res) => {
    const supplierId = req.params.id;
    const { name, contact_person, phone, email, address } = req.body;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ? WHERE id = ? AND business_id = ?',
            [name, contact_person || null, phone || null, email || null, address || null, supplierId, businessId]
        );
        if (result.affectedRows === 0) {
            await logActivity(businessId, req.user.id, 'UPDATE_SUPPLIER_FAILED', `Attempted to update non-existent or unauthorized supplier ID ${supplierId}.`); // <-- LOG GAGAL
            return res.status(404).json({ message: 'Supplier tidak ditemukan atau Anda tidak punya akses.' });
        }
        await logActivity(businessId, req.user.id, 'UPDATE_SUPPLIER', `Updated supplier ID ${supplierId} to name ${name}.`); // <-- LOG BERHASIL
        res.json({ message: 'Supplier berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating supplier:', error);
        await logActivity(businessId, req.user.id, 'UPDATE_SUPPLIER_ERROR', `Error updating supplier ID ${supplierId}. Error: ${error.message}`); // <-- LOG ERROR SERVER
        res.status(500).json({ message: 'Server Error' });
    }
});
// DELETE supplier
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const supplierId = req.params.id;
    const businessId = req.user.business_id;
    try {
        await db.query('UPDATE products SET supplier_id = NULL WHERE supplier_id = ? AND business_id = ?', [supplierId, businessId]);
        
        const [result] = await db.query('DELETE FROM suppliers WHERE id = ? AND business_id = ?', [supplierId, businessId]);
        if (result.affectedRows === 0) {
            await logActivity(businessId, req.user.id, 'DELETE_SUPPLIER_FAILED', `Attempted to delete non-existent or unauthorized supplier ID ${supplierId}.`); // <-- LOG GAGAL
            return res.status(404).json({ message: 'Supplier tidak ditemukan atau Anda tidak punya akses.' });
        }
        await logActivity(businessId, req.user.id, 'DELETE_SUPPLIER', `Deleted supplier ID ${supplierId}.`); // <-- LOG BERHASIL
        res.json({ message: 'Supplier berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        await logActivity(businessId, req.user.id, 'DELETE_SUPPLIER_ERROR', `Error deleting supplier ID ${supplierId}. Error: ${error.message}`); // <-- LOG ERROR SERVER
        res.status(500).json({ message: 'Server Error' });
    }
});
module.exports = router;