// backend/routes/customerRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

// GET semua pelanggan berdasarkan business_id
router.get('/', protect, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const searchTerm = req.query.search || '';
        const query = 'SELECT id, name, email, phone, address, points, created_at FROM customers WHERE business_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?) ORDER BY name ASC';
        const [customers] = await db.query(query, [businessId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET detail satu pelanggan
router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.business_id;
        const query = 'SELECT id, name, email, phone, address, points, created_at FROM customers WHERE id = ? AND business_id = ?';
        const [[customer]] = await db.query(query, [id, businessId]);
        if (!customer) {
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan.' });
        }
        res.json(customer);
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET riwayat transaksi satu pelanggan
router.get('/:id/history', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.business_id;
        const query = `
            SELECT id, created_at, total_amount, points_earned 
            FROM orders 
            WHERE customer_id = ? AND business_id = ? 
            ORDER BY created_at DESC
        `;
        const [history] = await db.query(query, [id, businessId]);
        res.json(history);
    } catch (error) {
        console.error('Error fetching customer history:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST untuk menukarkan poin
router.post('/:id/redeem', protect, async (req, res) => {
    const { id } = req.params;
    const { pointsToRedeem, description } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!pointsToRedeem || pointsToRedeem <= 0 || !description) {
        return res.status(400).json({ message: 'Jumlah poin dan deskripsi penukaran harus diisi.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[customer]] = await connection.query(
            'SELECT points, name FROM customers WHERE id = ? AND business_id = ? FOR UPDATE',
            [id, businessId]
        );

        if (!customer) {
            throw new Error('Pelanggan tidak ditemukan.');
        }
        if (customer.points < pointsToRedeem) {
            throw new Error('Poin pelanggan tidak mencukupi.');
        }

        // Kurangi poin pelanggan
        await connection.query(
            'UPDATE customers SET points = points - ? WHERE id = ?',
            [pointsToRedeem, id]
        );

        // Catat di log poin
        await connection.query(
            'INSERT INTO customer_points_log (customer_id, points_change, description) VALUES (?, ?, ?)',
            [id, -pointsToRedeem, description]
        );
        await connection.commit();
        await logActivity(businessId, userId, 'REDEEM_POINTS', `Redeemed ${pointsToRedeem} points for customer ${customer.name} (ID: ${id}). Reason: ${description}`);
        res.json({ message: 'Poin berhasil ditukarkan.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error redeeming points:", error);
        res.status(500).json({ message: error.message || 'Gagal menukarkan poin.' });
    } finally {
        connection.release();
    }
});


// POST buat pelanggan baru
router.post('/', protect, async (req, res) => {
    const { name, phone, email, address } = req.body;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'INSERT INTO customers (business_id, name, phone, email, address, points) VALUES (?, ?, ?, ?, ?, 0)',
            [businessId, name, phone || null, email || null, address || null]
        );
        const customerId = result.insertId;
        await logActivity(businessId, req.user.id, 'CREATE_CUSTOMER', `Created customer: ${name} (ID: ${customerId}).`);
        res.status(201).json({ message: 'Pelanggan berhasil ditambahkan.', customerId: customerId });
    } catch (error) {
        console.error('Error creating customer:', error);
        await logActivity(businessId, req.user.id, 'CREATE_CUSTOMER_FAILED', `Failed to create customer ${name}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT update pelanggan
router.put('/:id', protect, async (req, res) => {
    const { name, phone, email, address } = req.body;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query(
            'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ? AND business_id = ?',
            [name, phone || null, email || null, address || null, req.params.id, businessId]
        );
        if (result.affectedRows === 0) {
            await logActivity(businessId, req.user.id, 'UPDATE_CUSTOMER_FAILED', `Attempted to update non-existent or unauthorized customer ID ${req.params.id}.`);
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan atau Anda tidak punya akses.' });
        }
        await logActivity(businessId, req.user.id, 'UPDATE_CUSTOMER', `Updated customer ID ${req.params.id} to name ${name}.`);
        res.json({ message: 'Data pelanggan berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating customer:', error);
        await logActivity(businessId, req.user.id, 'UPDATE_CUSTOMER_ERROR', `Error updating customer ID ${req.params.id}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE pelanggan
router.delete('/:id', protect, async (req, res) => {
    const customerId = req.params.id;
    const businessId = req.user.business_id;
    try {
        await db.query('UPDATE orders SET customer_id = NULL WHERE customer_id = ? AND business_id = ?', [customerId, businessId]);
        
        const [result] = await db.query('DELETE FROM customers WHERE id = ? AND business_id = ?', [customerId, businessId]);
        if (result.affectedRows === 0) {
            await logActivity(businessId, req.user.id, 'DELETE_CUSTOMER_FAILED', `Attempted to delete non-existent or unauthorized customer ID ${customerId}.`);
            return res.status(404).json({ message: 'Pelanggan tidak ditemukan atau Anda tidak punya akses.' });
        }
        await logActivity(businessId, req.user.id, 'DELETE_CUSTOMER', `Deleted customer ID ${customerId}.`);
        res.json({ message: 'Pelanggan berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        await logActivity(businessId, req.user.id, 'DELETE_CUSTOMER_ERROR', `Error deleting customer ID ${customerId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;