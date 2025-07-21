const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint untuk membuat pesanan baru
router.post('/', protect, async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Keranjang belanja tidak boleh kosong.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    for (const item of items) {
      const [products] = await connection.query('SELECT price, stock FROM products WHERE id = ? FOR UPDATE', [item.productId]);
      if (products.length === 0) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }
      const product = products[0];
      if (product.stock < item.quantity) {
        throw new Error(`Stok produk dengan ID ${item.productId} tidak mencukupi.`);
      }
      totalAmount += product.price * item.quantity;
    }

    const orderSql = 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)';
    const [orderResult] = await connection.query(orderSql, [userId, totalAmount]);
    const orderId = orderResult.insertId;

    for (const item of items) {
      const [products] = await connection.query('SELECT price FROM products WHERE id = ?', [item.productId]);
      const currentPrice = products[0].price;

      const orderItemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
      await connection.query(orderItemSql, [orderId, item.productId, item.quantity, currentPrice]);

      const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
      await connection.query(updateStockSql, [item.quantity, item.productId]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Transaksi berhasil dibuat!', orderId: orderId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message || 'Transaksi gagal.' });
  } finally {
    connection.release();
  }
});

// Endpoint untuk mendapatkan semua pesanan
router.get('/', protect, async (req, res) => {
    try {
        const query = `
            SELECT o.id, o.total_amount, o.created_at, u.name as cashier_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        const [orders] = await db.query(query);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Endpoint untuk mendapatkan detail satu pesanan
router.get('/:id', protect, async (req, res) => {
    try {
        const orderQuery = `
            SELECT o.id, o.total_amount, o.created_at, u.name as cashier_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `;
        const [[order]] = await db.query(orderQuery, [req.params.id]);

        if (!order) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan" });
        }

        const itemsQuery = `
            SELECT oi.quantity, oi.price, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsQuery, [req.params.id]);

        res.json({ ...order, items });
    } catch (error) {
        console.error(`Error fetching order ${req.params.id}:`, error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Endpoint untuk menghapus pesanan
router.delete('/:id', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Hanya admin." });
    }

    try {
        const query = 'DELETE FROM orders WHERE id = ?';
        const [result] = await db.query(query, [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan." });
        }

        res.json({ message: "Pesanan berhasil dihapus." });
    } catch (error) {
        console.error(`Error deleting order ${req.params.id}:`, error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;