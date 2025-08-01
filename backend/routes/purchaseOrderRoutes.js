// C:\Users\Ibnu\Project\smart-pos\backend\routes\purchaseOrderRoutes.js

const express = require('express');
const db = require('../config/db');
// FIX: Import both protect and isAdmin from the middleware file
const { protect, isAdmin } = require('../middleware/authMiddleware'); 
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

// The original `isAdmin` middleware block is no longer needed here because it's now
// imported directly from `authMiddleware.js`. This makes the code cleaner and more reusable.

// POST /api/purchase-orders - Membuat Purchase Order baru
router.post('/', protect, isAdmin, async (req, res) => {
    const { supplier_id, notes, items } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Pemasok dan minimal satu item harus dipilih.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const date = new Date();
        const yyyymmdd = date.getFullYear().toString() + (date.getMonth() + 1).toString().padStart(2, '0') + date.getDate().toString().padStart(2, '0');
        const [[{count}]] = await connection.query('SELECT COUNT(id) as count FROM purchase_orders WHERE DATE(created_at) = CURDATE() AND business_id = ?', [businessId]);
        const po_number = `PO-${yyyymmdd}-${count + 1}`;

        const poSql = 'INSERT INTO purchase_orders (business_id, supplier_id, po_number, notes) VALUES (?, ?, ?, ?)';
        const [poResult] = await connection.query(poSql, [businessId, supplier_id, po_number, notes || null]);
        const purchaseOrderId = poResult.insertId;

        for (const item of items) {
            if (!item.product_id || !item.quantity || !item.cost_price) {
                throw new Error('Setiap item harus memiliki produk, kuantitas, dan harga beli.');
            }
            const itemSql = 'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, cost_price) VALUES (?, ?, ?, ?)';
            await connection.query(itemSql, [purchaseOrderId, item.product_id, item.quantity, item.cost_price]);
        }

        await connection.commit();
        await logActivity(businessId, userId, 'CREATE_PO', `Membuat Purchase Order ${po_number} (ID: ${purchaseOrderId}).`);
        res.status(201).json({ message: 'Purchase Order berhasil dibuat!', purchaseOrderId });

    } catch (error) {
        await connection.rollback();
        console.error("Error creating Purchase Order:", error);
        await logActivity(businessId, userId, 'CREATE_PO_FAILED', `Gagal membuat PO. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        connection.release();
    }
});

// GET /api/purchase-orders - Mengambil semua Purchase Order
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const query = `
            SELECT 
                po.id, 
                po.po_number, 
                po.status, 
                po.created_at, 
                s.name as supplier_name,
                (SELECT CAST(SUM(quantity * cost_price) AS DECIMAL(15,2)) FROM purchase_order_items WHERE purchase_order_id = po.id) as total_amount
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.business_id = ?
            ORDER BY po.created_at DESC;
        `;
        const [purchaseOrders] = await db.query(query, [businessId]);
        res.json(purchaseOrders);
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/purchase-orders/:id - Detail PO
router.get('/:id', protect, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.business_id;

        const poQuery = `
            SELECT po.*, s.name as supplier_name, s.address as supplier_address, s.phone as supplier_phone
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.id = ? AND po.business_id = ?;
        `;
        const [[poDetails]] = await db.query(poQuery, [id, businessId]);

        if (!poDetails) {
            return res.status(404).json({ message: 'Purchase Order tidak ditemukan.' });
        }

        const itemsQuery = `
            SELECT poi.*, p.name as product_name
            FROM purchase_order_items poi
            JOIN products p ON poi.product_id = p.id
            WHERE poi.purchase_order_id = ?;
        `;
        const [items] = await db.query(itemsQuery, [id]);

        res.json({ ...poDetails, items });

    } catch (error) {
        console.error('Error fetching PO details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// PATCH /api/purchase-orders/:id/status - Update status
router.patch('/:id/status', protect, isAdmin, async (req, res) => {
    const { id: purchaseOrderId } = req.params;
    const { status: newStatus } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    const validStatuses = ['DRAFT', 'SUBMITTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: 'Status tidak valid.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        if (newStatus === 'COMPLETED') {
            const [items] = await connection.query('SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = ?', [purchaseOrderId]);
            if (items.length === 0) throw new Error('Tidak ada item di dalam Purchase Order ini.');

            for (const item of items) {
                await connection.query('UPDATE products SET stock = stock + ? WHERE id = ? AND business_id = ?', [item.quantity, item.product_id, businessId]);
            }
        }

        const [result] = await connection.query('UPDATE purchase_orders SET status = ? WHERE id = ? AND business_id = ?', [newStatus, purchaseOrderId, businessId]);

        if (result.affectedRows === 0) {
            throw new Error('Purchase Order tidak ditemukan atau Anda tidak memiliki akses.');
        }

        await connection.commit();
        await logActivity(businessId, userId, 'UPDATE_PO_STATUS', `Status PO ID ${purchaseOrderId} diubah menjadi ${newStatus}. Stok diperbarui jika selesai.`);
        res.status(200).json({ message: `Status Purchase Order berhasil diubah menjadi ${newStatus}.` });

    } catch (error) {
        await connection.rollback();
        console.error('Error updating PO status:', error);
        await logActivity(businessId, userId, 'UPDATE_PO_STATUS_FAILED', `Gagal mengubah status PO ID ${purchaseOrderId}. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        connection.release();
    }
});

module.exports = router;