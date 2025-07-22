const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// CREATE: Menambah produk baru
router.post('/', protect, async (req, res) => {
  // Otorisasi: Hanya admin yang bisa melakukan aksi ini
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Memerlukan peran admin.' });
  }

  const { name, description, price, stock, category_id, sub_category_id, image_url } = req.body;
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ message: 'Nama, harga, dan stok harus diisi.' });
  }

  try {
    const sql = 'INSERT INTO products (name, description, price, stock, category_id, sub_category_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, description, price, stock, category_id || null, sub_category_id || null, image_url || null]);
    res.status(201).json({ message: 'Produk berhasil ditambahkan!', productId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// READ: Mendapatkan semua produk (bisa diakses semua user yang login)
router.get('/', protect, async (req, res) => {
  try {
    const sql = `
      SELECT p.*, c.name AS category_name, sc.name AS sub_category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      ORDER BY p.created_at DESC
    `;
    const [products] = await db.query(sql);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// UPDATE: Mengubah data produk
router.put('/:id', protect, async (req, res) => {
  // Otorisasi: Hanya admin yang bisa melakukan aksi ini
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Memerlukan peran admin.' });
  }

  const { name, description, price, stock, category_id, sub_category_id, image_url } = req.body;
  
  try {
    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, sub_category_id = ?, image_url = ? WHERE id = ?';
    const [result] = await db.query(sql, [name, description, price, stock, category_id || null, sub_category_id || null, image_url || null, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ message: 'Produk berhasil diperbarui!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// DELETE: Menghapus produk
router.delete('/:id', protect, async (req, res) => {
  // Otorisasi: Hanya admin yang bisa melakukan aksi ini
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Memerlukan peran admin.' });
  }
  
  try {
    const sql = 'DELETE FROM products WHERE id = ?';
    const [result] = await db.query(sql, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;