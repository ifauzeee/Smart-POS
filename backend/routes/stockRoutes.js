// backend/routes/stockRoutes.js
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

// Endpoint utama untuk melakukan penyesuaian stok
router.post('/adjust', protect, isAdmin, async (req, res) => {
    const { productId, newStockQuantity, type, reason } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (productId == null || newStockQuantity == null || !type) {
        return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Ambil stok saat ini dan kunci baris produk untuk mencegah update bersamaan
        const [[product]] = await connection.query(
            'SELECT stock, name FROM products WHERE id = ? AND business_id = ? FOR UPDATE',
            [productId, businessId]
        );

        if (!product) {
            throw new Error('Produk tidak ditemukan.');
        }

        const currentStock = product.stock;
        const quantityChange = newStockQuantity - currentStock;

        // 2. Catat perubahan di tabel stock_adjustments
        await connection.query(
            'INSERT INTO stock_adjustments (business_id, product_id, user_id, type, quantity_change, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [businessId, productId, userId, type, quantityChange, reason || null]
        );

        // 3. Update jumlah stok di tabel products
        await connection.query(
            'UPDATE products SET stock = ? WHERE id = ?',
            [newStockQuantity, productId]
        );
        
        await connection.commit();
        
        await logActivity(businessId, userId, 'STOCK_ADJUSTMENT', `Stok produk "${product.name}" (ID: ${productId}) diubah dari ${currentStock} menjadi ${newStockQuantity}. Alasan: ${type}.`);
        res.status(200).json({ message: 'Stok berhasil disesuaikan.' });

    } catch (error) {
        await connection.rollback();
        console.error("Stock Adjustment Error:", error);
        res.status(500).json({ message: error.message || 'Gagal menyesuaikan stok.' });
    } finally {
        connection.release();
    }
});

module.exports = router;