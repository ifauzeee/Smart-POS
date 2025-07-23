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

// CREATE: Menambah produk baru
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, description, price, cost_price, stock, low_stock_threshold, category_id, sub_category_id, supplier_id, image_url } = req.body;
    if (name === undefined || price === undefined || stock === undefined || cost_price === undefined) {
        return res.status(400).json({ message: 'Nama, harga jual, harga beli, dan stok harus diisi.' });
    }
    try {
        const sql = 'INSERT INTO products (name, description, price, cost_price, stock, low_stock_threshold, category_id, sub_category_id, supplier_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [name, description || null, price, cost_price, stock, low_stock_threshold || 5, category_id || null, sub_category_id || null, supplier_id || null, image_url || null]);
        res.status(201).json({ message: 'Produk berhasil ditambahkan!', productId: result.insertId });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// READ: Mendapatkan semua produk
router.get('/', protect, async (req, res) => {
    try {
        const sql = `
            SELECT p.*, c.name AS category_name, sc.name AS sub_category_name, s.name AS supplier_name
            FROM products AS p
            LEFT JOIN categories AS c ON p.category_id = c.id
            LEFT JOIN sub_categories AS sc ON p.sub_category_id = sc.id
            LEFT JOIN suppliers AS s ON p.supplier_id = s.id
            ORDER BY p.created_at DESC
        `;
        const [products] = await db.query(sql);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// UPDATE: Mengubah data produk
router.put('/:id', protect, isAdmin, async (req, res) => {
    const { name, description, price, cost_price, stock, low_stock_threshold, category_id, sub_category_id, supplier_id, image_url } = req.body;
    try {
        const sql = 'UPDATE products SET name = ?, description = ?, price = ?, cost_price = ?, stock = ?, low_stock_threshold = ?, category_id = ?, sub_category_id = ?, supplier_id = ?, image_url = ? WHERE id = ?';
        const [result] = await db.query(sql, [name, description, price, cost_price, stock, low_stock_threshold, category_id || null, sub_category_id || null, supplier_id || null, image_url || null, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        res.json({ message: 'Produk berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// DELETE: Menghapus produk
router.delete('/:id', protect, isAdmin, async (req, res) => {
    try {
        const sql = 'DELETE FROM products WHERE id = ?';
        const [result] = await db.query(sql, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        res.json({ message: 'Produk berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;