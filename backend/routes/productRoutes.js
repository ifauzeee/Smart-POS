const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// -- RUTE-RUTE UNTUK MANAJEMEN PRODUK --

// 1. CREATE: Menambah produk baru (Hanya Admin)
router.post('/', protect, async (req, res) => {
  // Otorisasi: Cek apakah pengguna adalah admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menambah produk.' });
  }

  const { name, description, price, stock, category } = req.body;

  if (!name || !price || stock === undefined) {
    return res.status(400).json({ message: 'Nama, harga, dan stok harus diisi.' });
  }

  try {
    const sql = 'INSERT INTO products (name, description, price, stock, category) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, description, price, stock, category]);
    res.status(201).json({ message: 'Produk berhasil ditambahkan!', productId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 2. READ: Mendapatkan semua produk
router.get('/', protect, async (req, res) => {
  try {
    const sql = 'SELECT * FROM products ORDER BY created_at DESC';
    const [products] = await db.query(sql);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 3. READ: Mendapatkan satu produk berdasarkan ID
router.get('/:id', protect, async (req, res) => {
  try {
    const sql = 'SELECT * FROM products WHERE id = ?';
    const [products] = await db.query(sql, [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json(products[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 4. UPDATE: Mengubah data produk (Hanya Admin)
router.put('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengubah produk.' });
  }

  const { name, description, price, stock, category } = req.body;
  
  try {
    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ? WHERE id = ?';
    const [result] = await db.query(sql, [name, description, price, stock, category, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ message: 'Produk berhasil diperbarui!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// 5. DELETE: Menghapus produk (Hanya Admin)
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menghapus produk.' });
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