// backend/routes/stockRoutes.js
const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated: Import isAdmin
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator'); // Import validator

const router = express.Router();

// The local isAdmin function has been removed from here.
// It should now be defined and exported from '../middleware/authMiddleware.js'.

// --- Validation Rules ---

const stockAdjustmentValidationRules = [
    body('productId')
        .notEmpty().withMessage('ID produk tidak boleh kosong.')
        .isInt({ min: 1 }).withMessage('ID produk tidak valid.'),
    body('newStockQuantity')
        .notEmpty().withMessage('Kuantitas stok baru tidak boleh kosong.')
        .isInt({ min: 0 }).withMessage('Kuantitas stok baru harus berupa angka non-negatif.'),
    body('type')
        .trim()
        .notEmpty().withMessage('Tipe penyesuaian tidak boleh kosong.')
        .isIn(['increase', 'decrease', 'correction']).withMessage('Tipe penyesuaian tidak valid (harus "increase", "decrease", atau "correction").'),
    body('reason')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('Alasan penyesuaian maksimal 255 karakter.')
];

// --- Stock Adjustment Endpoint ---

/**
 * @route POST /api/stock/adjust
 * @desc Adjust the stock quantity of a product and log the adjustment.
 * @access Private (Admin only)
 */
router.post('/adjust', protect, isAdmin, stockAdjustmentValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { productId, newStockQuantity, type, reason } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get current stock and lock the product row to prevent concurrent updates
        const [[product]] = await connection.query(
            'SELECT stock, name FROM products WHERE id = ? AND business_id = ? FOR UPDATE',
            [productId, businessId]
        );

        if (!product) {
            await connection.rollback();
            return res.status(404).json({ message: 'Produk tidak ditemukan atau bukan milik bisnis Anda.' });
        }

        const currentStock = product.stock;
        const quantityChange = newStockQuantity - currentStock; // Calculate the change

        // 2. Record the change in the stock_adjustments table
        await connection.query(
            'INSERT INTO stock_adjustments (business_id, product_id, user_id, type, quantity_change, reason) VALUES (?, ?, ?, ?, ?, ?)',
            [businessId, productId, userId, type, quantityChange, reason || null]
        );

        // 3. Update the stock quantity in the products table
        await connection.query(
            'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
        if (connection) connection.release();
    }
});

module.exports = router;