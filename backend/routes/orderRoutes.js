const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const { decrypt } = require('../utils/encryption');

const router = express.Router();

// POST /api/orders - Membuat pesanan baru
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
        throw new Error(`Stok untuk produk ID ${item.productId} tidak mencukupi.`);
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
    console.error('Checkout Error:', error);
    res.status(500).json({ message: error.message || 'Transaksi gagal.' });
  } finally {
    connection.release();
  }
});

// GET /api/orders - Mendapatkan semua pesanan
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
        res.status(500).json({ message: "Server Error" });
    }
});

// GET /api/orders/:id - Mendapatkan detail satu pesanan
router.get('/:id', protect, async (req, res) => {
    try {
        const orderQuery = `
            SELECT o.id, o.total_amount, o.created_at, u.name as cashier_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `;
        const [[order]] = await db.query(orderQuery, [req.params.id]);

        if (!order) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

        const itemsQuery = `
            SELECT oi.quantity, oi.price, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsQuery, [req.params.id]);

        res.json({ ...order, items });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE /api/orders/:id - Menghapus pesanan
router.delete('/:id', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak." });
    }
    try {
        const query = 'DELETE FROM orders WHERE id = ?';
        const [result] = await db.query(query, [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Pesanan tidak ditemukan." });

        res.json({ message: "Pesanan berhasil dihapus." });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// POST /api/orders/:id/send-receipt - Mengirim struk via email
router.post('/:id/send-receipt', protect, async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email tujuan harus diisi." });

    try {
        // ... (Kode untuk mengambil detail order dan items)
        const orderQuery = `SELECT o.id, o.total_amount, o.created_at, u.name as cashier_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?`;
        const [[order]] = await db.query(orderQuery, [req.params.id]);
        if (!order) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

        const itemsQuery = `SELECT oi.quantity, oi.price, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`;
        const [items] = await db.query(itemsQuery, [req.params.id]);
        
        // ... (Kode untuk membuat HTML email)
        const emailHtml = `...`; // (Konten HTML Anda di sini)

        // ... (Kode untuk mencari kredensial admin dan mengirim email)
        const [[admin]] = await db.query('SELECT smtp_email_user, smtp_email_pass FROM users WHERE role = "admin" LIMIT 1');
        if (!admin || !admin.smtp_email_user || !admin.smtp_email_pass) {
            return res.status(500).json({ message: "Setelan email admin belum dikonfigurasi." });
        }
        const decryptedPassword = decrypt(admin.smtp_email_pass);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: admin.smtp_email_user, pass: decryptedPassword },
        });
        await transporter.sendMail({
            from: `"${admin.smtp_email_user}" <${admin.smtp_email_user}>`,
            to: email,
            subject: `Struk untuk Pesanan #${order.id}`,
            html: emailHtml,
        });

        res.json({ message: "Struk berhasil dikirim ke email." });

    } catch (error) {
        console.error('Error sending receipt:', error);
        res.status(500).json({ message: "Gagal mengirim struk." });
    }
});

module.exports = router;