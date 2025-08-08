const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getValidDateRange } = require('../utils/dateUtils');
const { sendReceiptEmail } = require('../utils/emailService');
const { logActivity } = require('../utils/logUtils');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

// =================================================================
// FUNGSI UTAMA: Pembaruan Stok
// =================================================================

/**
 * @description Fungsi ini mengelola pembaruan stok untuk produk jadi dan bahan baku.
 * Ini adalah bagian perbaikan utama yang memastikan konsistensi stok.
 * @param {object} connection - Koneksi database.
 * @param {Array<object>} items - Daftar item dalam pesanan.
 * @param {number} factor - Faktor pengali untuk stok (1 untuk pesanan baru, -1 untuk pembatalan).
 * @param {boolean} validateOnly - Jika true, hanya memeriksa stok tanpa melakukan pembaruan.
 */
async function handleStockUpdate(connection, items, factor = 1, validateOnly = false) {
    for (const item of items) {
        // Mendapatkan product_id dari variant_id
        const [[variant]] = await connection.query('SELECT product_id FROM product_variants WHERE id = ?', [item.variantId || item.variant_id]);
        if (!variant) {
            throw new Error(`Varian produk dengan ID ${item.variantId || item.variant_id} tidak ditemukan.`);
        }
        const productId = variant.product_id;

        // Langkah 1: SELALU periksa dan kurangi/tambah stok produk jadi
        const [[product]] = await connection.query('SELECT name, stock FROM products WHERE id = ? FOR UPDATE', [productId]);
        if (!product) {
            throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
        }
        if (factor > 0 && product.stock < item.quantity) {
            throw new Error(`Stok untuk produk "${product.name}" tidak mencukupi.`);
        }
        if (!validateOnly) {
            await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity * factor, productId]);
        }

        // Langkah 2: JIKA produk memiliki resep, kurangi/tambah JUGA stok bahan bakunya
        const [recipeItems] = await connection.query('SELECT * FROM recipes WHERE product_id = ?', [productId]);
        if (recipeItems.length > 0) {
            for (const recipeItem of recipeItems) {
                const [[material]] = await connection.query('SELECT name, stock_quantity, unit FROM raw_materials WHERE id = ? FOR UPDATE', [recipeItem.raw_material_id]);
                if (!material) {
                    throw new Error(`Bahan baku dengan ID ${recipeItem.raw_material_id} tidak ditemukan.`);
                }
                const requiredQuantity = recipeItem.quantity_used * item.quantity;
                if (factor > 0 && material.stock_quantity < requiredQuantity) {
                    throw new Error(`Stok bahan baku "${material.name}" tidak cukup untuk membuat ${product.name}. Butuh ${requiredQuantity} ${material.unit}, tersedia ${material.stock_quantity} ${material.unit}.`);
                }
                if (!validateOnly) {
                    await connection.execute('UPDATE raw_materials SET stock_quantity = stock_quantity - ? WHERE id = ?', [requiredQuantity * factor, recipeItem.raw_material_id]);
                }
            }
        }
    }
}

// =================================================================
// ENDPOINTS
// =================================================================

/**
 * @route   POST /api/orders
 * @desc    Membuat pesanan baru
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    const { items, customer_id, payment_method, amount_paid, subtotal_amount, tax_amount, total_amount, promotion_id, discount_amount } = req.body;
    const userId = req.user.id;
    const businessId = req.user.business_id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Keranjang belanja tidak boleh kosong.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Langkah 1: Validasi stok (tanpa update)
        await handleStockUpdate(connection, items, 1, true);

        // Menghitung poin yang didapat
        const pointsEarned = Math.floor(total_amount / 10000);

        // Memasukkan data pesanan utama
        const orderSql = 'INSERT INTO orders (business_id, user_id, customer_id, subtotal_amount, tax_amount, total_amount, payment_method, amount_paid, promotion_id, discount_amount, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [orderResult] = await connection.execute(orderSql, [businessId, userId, customer_id || null, subtotal_amount, tax_amount || 0, total_amount, payment_method || 'Tunai', amount_paid, promotion_id || null, discount_amount || 0, pointsEarned]);
        const orderId = orderResult.insertId;

        // Memasukkan item-item pesanan
        for (const item of items) {
            const [[variant]] = await connection.query('SELECT product_id, price, cost_price FROM product_variants WHERE id = ?', [item.variantId]);
            const orderItemSql = 'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, cost_price) VALUES (?, ?, ?, ?, ?, ?)';
            await connection.execute(orderItemSql, [orderId, variant.product_id, item.variantId, item.quantity, variant.price, variant.cost_price]);
        }

        // Langkah 2: Update stok produk dan bahan baku yang sebenarnya
        await handleStockUpdate(connection, items, 1, false);

        // Jika ada pelanggan, perbarui poinnya
        if (customer_id) {
            if (pointsEarned > 0) {
                await connection.execute('INSERT INTO customer_points_log (customer_id, order_id, points_change, description, user_id) VALUES (?, ?, ?, ?, ?)', [customer_id, orderId, pointsEarned, `Poin dari Transaksi #${orderId}`, userId]);
            }
            // Sinkronisasi total poin pelanggan
            const [[newTotalPoints]] = await connection.query('SELECT SUM(points_change) as total FROM customer_points_log WHERE customer_id = ?', [customer_id]);
            await connection.execute('UPDATE customers SET points = ? WHERE id = ?', [newTotalPoints.total || 0, customer_id]);
        }

        await connection.commit();
        await logActivity(businessId, userId, 'CREATE_ORDER', `Membuat order ID ${orderId} dengan total ${total_amount}.`);
        res.status(201).json({ message: 'Transaksi berhasil dibuat!', orderId: orderId });
    } catch (error) {
        await connection.rollback();
        console.error("Create Order Error:", error);
        await logActivity(businessId, userId, 'CREATE_ORDER_FAILED', `Gagal membuat order. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Transaksi gagal.' });
    } finally {
        connection.release();
    }
});

/**
 * @route   GET /api/orders
 * @desc    Mendapatkan daftar semua pesanan dalam rentang tanggal
 * @access  Private (hanya untuk Admin)
 */
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const sql = `
            SELECT o.id, o.created_at, o.total_amount, o.payment_method, u.name as cashier_name, c.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.business_id = ? AND o.created_at BETWEEN ? AND ?
            ORDER BY o.created_at DESC
        `;
        const [orders] = await db.query(sql, [businessId, startDate, endDate]);
        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Mendapatkan detail pesanan tunggal
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const orderId = req.params.id;
        const orderSql = `
            SELECT o.*, u.name as cashier_name, c.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ? AND o.business_id = ?`;
        const [[order]] = await db.query(orderSql, [orderId, businessId]);
        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }
        const itemsSql = `SELECT oi.*, p.name as product_name, pv.name as variant_name FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN product_variants pv ON oi.variant_id = pv.id WHERE oi.order_id = ?`;
        const [items] = await db.query(itemsSql, [orderId]);
        res.json({ ...order, items });
    } catch (error) {
        console.error("Error fetching single order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   DELETE /api/orders/clear-history
 * @desc    Menghapus semua riwayat transaksi (hard reset)
 * @access  Private (hanya untuk Admin)
 */
router.delete('/clear-history', protect, isAdmin, async (req, res) => {
    const connection = await db.getConnection();
    const businessId = req.user.business_id;
    const userId = req.user.id;
    try {
        await connection.beginTransaction();

        await connection.query('DELETE cpl FROM customer_points_log cpl JOIN customers c ON cpl.customer_id = c.id WHERE c.business_id = ?', [businessId]);
        await connection.query('DELETE oi FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.business_id = ?', [businessId]);
        const [ordersDeleteResult] = await connection.query('DELETE FROM orders WHERE business_id = ?', [businessId]);
        await connection.query('UPDATE customers SET points = 0 WHERE business_id = ?', [businessId]);

        // Mereset AUTO_INCREMENT agar ID dimulai dari 1 lagi
        await connection.query('ALTER TABLE orders AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE customer_points_log AUTO_INCREMENT = 1');

        await connection.commit();
        await logActivity(businessId, userId, 'HARD_RESET_HISTORY', `Menghapus ${ordersDeleteResult.affectedRows} order dan SEMUA poin pelanggan.`);
        res.status(200).json({ message: 'Semua riwayat transaksi dan poin pelanggan telah di-reset sepenuhnya.' });

    } catch (error) {
        await connection.rollback();
        console.error("Error clearing history:", error);
        await logActivity(businessId, userId, 'CLEAR_ORDER_HISTORY_FAILED', `Gagal menghapus riwayat order. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Gagal menghapus riwayat.' });
    } finally {
        connection.release();
    }
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Menghapus pesanan tunggal dan mengembalikan stok/poin
 * @access  Private (hanya untuk Admin)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const connection = await db.getConnection();
    const businessId = req.user.business_id;
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        await connection.beginTransaction();

        const [[order]] = await connection.query('SELECT * FROM orders WHERE id = ? AND business_id = ?', [orderId, businessId]);
        if (!order) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        const [itemsToRevert] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        if (itemsToRevert.length > 0) {
            // Mengembalikan stok produk dan bahan baku
            await handleStockUpdate(connection, itemsToRevert, -1, false);
        }

        // Mengembalikan poin pelanggan jika ada
        if (order.customer_id) {
            if (order.points_earned > 0) {
                // Mencatat poin negatif di log
                await connection.execute('INSERT INTO customer_points_log (customer_id, order_id, points_change, description, user_id) VALUES (?, ?, ?, ?, ?)', [order.customer_id, order.id, -Math.abs(order.points_earned), `Pembatalan Poin dari Order #${order.id}`, userId]);
            }
            // Sinkronisasi total poin pelanggan
            const [[newTotalPoints]] = await connection.query('SELECT SUM(points_change) as total FROM customer_points_log WHERE customer_id = ?', [order.customer_id]);
            await connection.execute('UPDATE customers SET points = ? WHERE id = ?', [newTotalPoints.total || 0, order.customer_id]);
        }

        // Menghapus data pesanan
        await connection.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
        await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);

        await connection.commit();
        await logActivity(businessId, userId, 'DELETE_ORDER', `Deleted order ID ${orderId}. Stock and points reverted.`);
        res.json({ message: 'Pesanan berhasil dihapus dan stok serta poin telah dikembalikan.' });
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting order:", error);
        await logActivity(businessId, userId, 'DELETE_ORDER_ERROR', `Error deleting order ID ${orderId}. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Gagal menghapus pesanan.' });
    } finally {
        connection.release();
    }
});

/**
 * @route   GET /api/orders/export
 * @desc    Mengekspor data transaksi ke file CSV
 * @access  Private (hanya untuk Admin)
 */
router.get('/export', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;
        const exportsDir = path.join(__dirname, '..', 'exports');

        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        const query = `
            SELECT o.id, o.created_at, u.name as cashier_name, c.name as customer_name, o.payment_method, oi.quantity, p.name as product_name, pv.name as variant_name, oi.price as price_per_item, (oi.price * oi.quantity) as subtotal
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants pv ON oi.variant_id = pv.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.business_id = ? AND o.created_at BETWEEN ? AND ?
            ORDER BY o.created_at DESC
        `;
        const [transactions] = await db.query(query, [businessId, startDate, endDate]);

        if (transactions.length === 0) {
            return res.status(404).json({ message: "Tidak ada data transaksi untuk diekspor pada rentang tanggal ini." });
        }

        const filePath = path.join(exportsDir, `transactions-${Date.now()}.csv`);
        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'id', title: 'ORDER_ID' }, { id: 'created_at', title: 'TANGGAL' }, { id: 'cashier_name', title: 'KASIR' }, { id: 'customer_name', title: 'PELANGGAN' },
                { id: 'payment_method', title: 'METODE_BAYAR' }, { id: 'product_name', title: 'PRODUK' }, { id: 'variant_name', title: 'VARIAN' },
                { id: 'quantity', title: 'JUMLAH' }, { id: 'price_per_item', title: 'HARGA_SATUAN' }, { id: 'subtotal', title: 'SUBTOTAL' },
            ]
        });

        await csvWriter.writeRecords(transactions);
        res.download(filePath, (err) => {
            if (err) console.error("Error sending file:", err);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        });
    } catch (error) {
        console.error("Error exporting transactions:", error);
        res.status(500).json({ message: "Gagal mengekspor data." });
    }
});

/**
 * @route   POST /api/orders/:id/send-receipt
 * @desc    Mengirim struk pesanan melalui email
 * @access  Private
 */
router.post('/:id/send-receipt', protect, async (req, res) => {
    const orderId = req.params.id;
    const { email: recipientEmail } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!recipientEmail) {
        return res.status(400).json({ message: 'Alamat email penerima diperlukan.' });
    }

    try {
        const orderSql = `SELECT o.*, u.name as cashier_name, c.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = ? AND o.business_id = ?`;
        const [[order]] = await db.query(orderSql, [orderId, businessId]);

        if (!order) {
            await logActivity(businessId, userId, 'SEND_RECEIPT_FAILED', `Order ID ${orderId} not found.`);
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        const itemsSql = `SELECT oi.quantity, oi.price, p.name as product_name, pv.name as variant_name FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN product_variants pv ON oi.variant_id = pv.id WHERE oi.order_id = ?`;
        const [items] = await db.query(itemsSql, [orderId]);
        order.items = items;

        const [[businessInfo]] = await db.query('SELECT id, business_name, receipt_footer_text, receipt_logo_url FROM businesses WHERE id = ?', [businessId]);

        await sendReceiptEmail(recipientEmail, order, businessInfo);
        await logActivity(businessId, userId, 'SEND_RECEIPT_SUCCESS', `Struk untuk order ID ${orderId} dikirim ke ${recipientEmail}.`);
        res.status(200).json({ message: 'Struk berhasil dikirim.' });
    } catch (error) {
        console.error("Error sending receipt:", error);
        await logActivity(businessId, userId, 'SEND_RECEIPT_FAILED', `Gagal mengirim struk untuk order ID ${orderId}. Error: ${error.message}`);
        if (error.responseCode === 535) {
            return res.status(500).json({ message: 'Gagal mengirim struk: Kesalahan otentikasi. Periksa setelan email Anda.' });
        }
        res.status(500).json({ message: error.message || 'Gagal mengirim struk.' });
    }
});

module.exports = router;