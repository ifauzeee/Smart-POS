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

// POST /api/orders - Membuat pesanan baru dengan logika resep
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

        // TAHAP 1: VALIDASI STOK (Produk Jadi atau Bahan Baku)
        for (const item of items) {
            const [[variant]] = await connection.query('SELECT product_id FROM product_variants WHERE id = ?', [item.variantId]);
            if (!variant) throw new Error(`Varian produk dengan ID ${item.variantId} tidak ditemukan.`);

            const productId = variant.product_id;
            const [[product]] = await connection.query('SELECT name FROM products WHERE id = ?', [productId]);

            // Cek apakah produk punya resep
            const [recipeItems] = await connection.query('SELECT * FROM recipes WHERE product_id = ?', [productId]);

            if (recipeItems.length > 0) {
                // Jika punya resep, cek stok bahan baku
                for (const recipeItem of recipeItems) {
                    const [[material]] = await connection.query(
                        'SELECT name, stock_quantity, unit FROM raw_materials WHERE id = ? FOR UPDATE',
                        [recipeItem.raw_material_id]
                    );
                    const requiredQuantity = recipeItem.quantity_used * item.quantity;
                    if (material.stock_quantity < requiredQuantity) {
                        throw new Error(`Stok bahan baku "${material.name}" tidak mencukupi untuk membuat ${product.name}. Butuh ${requiredQuantity} ${material.unit}, tersedia ${material.stock_quantity} ${material.unit}.`);
                    }
                }
            } else {
                // Jika tidak punya resep, cek stok produk jadi
                const [[productStock]] = await connection.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [productId]);
                if (productStock.stock < item.quantity) {
                    throw new Error(`Stok untuk produk "${product.name}" tidak mencukupi.`);
                }
            }
        }

        // TAHAP 2: BUAT PESANAN & ITEM PESANAN
        const pointsEarned = Math.floor(total_amount / 10000);
        const orderSql = 'INSERT INTO orders (business_id, user_id, customer_id, subtotal_amount, tax_amount, total_amount, payment_method, amount_paid, promotion_id, discount_amount, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [orderResult] = await connection.execute(orderSql, [businessId, userId, customer_id || null, subtotal_amount, tax_amount || 0, total_amount, payment_method || 'Tunai', amount_paid, promotion_id || null, discount_amount || 0, pointsEarned]);
        const orderId = orderResult.insertId;

        for (const item of items) {
            const [[variant]] = await connection.query('SELECT product_id, price, cost_price FROM product_variants WHERE id = ?', [item.variantId]);
            const orderItemSql = 'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, cost_price) VALUES (?, ?, ?, ?, ?, ?)';
            await connection.execute(orderItemSql, [orderId, variant.product_id, item.variantId, item.quantity, variant.price, variant.cost_price]);
        }

        // TAHAP 3: PENGURANGAN STOK (Bahan Baku atau Produk Jadi)
        for (const item of items) {
            const [[variant]] = await connection.query('SELECT product_id FROM product_variants WHERE id = ?', [item.variantId]);
            const productId = variant.product_id;

            const [recipeItems] = await connection.query('SELECT * FROM recipes WHERE product_id = ?', [productId]);

            if (recipeItems.length > 0) {
                // Jika punya resep, kurangi stok bahan baku
                for (const recipeItem of recipeItems) {
                    const quantityToDeduct = recipeItem.quantity_used * item.quantity;
                    await connection.execute(
                        'UPDATE raw_materials SET stock_quantity = stock_quantity - ? WHERE id = ?',
                        [quantityToDeduct, recipeItem.raw_material_id]
                    );
                }
            } else {
                // Jika tidak, kurangi stok produk jadi
                await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, productId]);
            }
        }

        // TAHAP 4: UPDATE POIN PELANGGAN
        if (customer_id && pointsEarned > 0) {
            await connection.execute('UPDATE customers SET points = points + ? WHERE id = ? AND business_id = ?', [pointsEarned, customer_id, businessId]);
            await connection.execute(
                'INSERT INTO customer_points_log (customer_id, order_id, points_change, description) VALUES (?, ?, ?, ?)',
                [customer_id, orderId, pointsEarned, `Poin dari Transaksi #${orderId}`]
            );
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

// GET /api/orders - Mendapatkan semua pesanan
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);

        const sql = `
            SELECT
                o.id,
                o.created_at,
                o.subtotal_amount,
                o.tax_amount,
                o.total_amount,
                o.payment_method,
                u.name as cashier_name,
                c.name as customer_name
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
        if (error.response && error.response.status === 401) {
            return res.status(401).json({ message: 'Otorisasi gagal, silakan login kembali.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/orders/export - Mengekspor data transaksi ke CSV
router.get('/export', protect, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = getValidDateRange(req.query.startDate, req.query.endDate);
        const businessId = req.user.business_id;

        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        const query = `
            SELECT
                o.id,
                o.created_at,
                u.name as cashier_name,
                c.name as customer_name,
                o.payment_method,
                oi.quantity,
                p.name as product_name,
                pv.name as variant_name,
                oi.price as price_per_item,
                (oi.price * oi.quantity) as subtotal
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN product_variants pv ON oi.variant_id = pv.id
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
                {id: 'id', title: 'ORDER_ID'},
                {id: 'created_at', title: 'TANGGAL'},
                {id: 'cashier_name', title: 'KASIR'},
                {id: 'customer_name', title: 'PELANGGAN'},
                {id: 'payment_method', title: 'METODE_BAYAR'},
                {id: 'product_name', title: 'PRODUK'},
                {id: 'variant_name', title: 'VARIAN'},
                {id: 'quantity', title: 'JUMLAH'},
                {id: 'price_per_item', title: 'HARGA_SATUAN'},
                {id: 'subtotal', title: 'SUBTOTAL'},
            ]
        });
        await csvWriter.writeRecords(transactions);

        res.download(filePath, (err) => {
            if (err) {
                console.error("Error sending file:", err);
            }
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        });
    } catch (error) {
        console.error("Error exporting transactions:", error);
        res.status(500).json({ message: "Gagal mengekspor data." });
    }
});

// GET /api/orders/:id - Mendapatkan detail pesanan berdasarkan ID
router.get('/:id', protect, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const orderId = req.params.id;

        const orderSql = `
            SELECT
                o.id, o.created_at,
                o.subtotal_amount,
                o.tax_amount,
                o.total_amount,
                o.payment_method,
                u.name as cashier_name, c.name as customer_name,
                o.amount_paid
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ? AND o.business_id = ?
        `;
        const [[order]] = await db.query(orderSql, [orderId, businessId]);

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        const itemsSql = `
            SELECT oi.quantity, oi.price, p.name as product_name, pv.name as variant_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants pv ON oi.variant_id = pv.id
            WHERE oi.order_id = ?
        `;
        const [items] = await db.query(itemsSql, [orderId]);
        order.items = items;

        res.json({ ...order, items });
    } catch (error) {
        console.error("Error fetching single order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/orders/:id/send-receipt - Mengirim struk via email
router.post('/:id/send-receipt', protect, async (req, res) => {
    const orderId = req.params.id;
    const { email: recipientEmail } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!recipientEmail) {
        return res.status(400).json({ message: 'Alamat email penerima diperlukan.' });
    }

    try {
        // Ambil data order dan bisnis
        const orderSql = `
            SELECT o.*, u.name as cashier_name, c.name as customer_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.id = ? AND o.business_id = ?`;
        const [[order]] = await db.query(orderSql, [orderId, businessId]);

        if (!order) {
            await logActivity(businessId, userId, 'SEND_RECEIPT_FAILED', `Order ID ${orderId} not found.`);
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        const itemsSql = `SELECT oi.quantity, oi.price, p.name as product_name, pv.name as variant_name FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN product_variants pv ON oi.variant_id = pv.id WHERE oi.order_id = ?`;
        const [items] = await db.query(itemsSql, [orderId]);
        order.items = items;

        const [[businessInfo]] = await db.query('SELECT id, business_name, receipt_footer_text, receipt_logo_url FROM businesses WHERE id = ?', [businessId]);

        // Panggil service email dengan data yang sudah siap
        await sendReceiptEmail(recipientEmail, order, businessInfo);

        await logActivity(businessId, userId, 'SEND_RECEIPT_SUCCESS', `Receipt for order ID ${orderId} sent to ${recipientEmail}.`);
        res.status(200).json({ message: 'Struk berhasil dikirim.' });

    } catch (error) {
        console.error("Error sending receipt:", error);
        await logActivity(businessId, userId, 'SEND_RECEIPT_FAILED', `Failed to send receipt for order ID ${orderId}. Error: ${error.message}`);

        if (error.responseCode === 535) {
            return res.status(500).json({ message: 'Gagal mengirim struk: Kesalahan otentikasi. Periksa setelan email Anda.' });
        }
        res.status(500).json({ message: error.message || 'Gagal mengirim struk.' });
    }
});

// DELETE /api/orders/clear-history - Menghapus seluruh riwayat transaksi dan mereset poin loyalitas
router.delete('/clear-history', protect, isAdmin, async (req, res) => {
    const connection = await db.getConnection();
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        await connection.beginTransaction();
        console.log(`Mencoba menghapus seluruh riwayat untuk business_id: ${businessId}`);

        const [ordersInBusiness] = await connection.query('SELECT id FROM orders WHERE business_id = ?', [businessId]);

        if (ordersInBusiness.length > 0) {
            const orderIdsToDelete = ordersInBusiness.map(order => order.id);

            console.log(`Menghapus ${orderIdsToDelete.length} item pesanan terkait...`);
            await connection.query('DELETE FROM order_items WHERE order_id IN (?)', [orderIdsToDelete]);

            console.log(`Menghapus ${orderIdsToDelete.length} pesanan...`);
            const [ordersDeleteResult] = await connection.query('DELETE FROM orders WHERE id IN (?)', [orderIdsToDelete]);
            await connection.commit();
            console.log("Seluruh riwayat transaksi untuk bisnis ini berhasil dihapus.");
            await logActivity(businessId, userId, 'CLEAR_ORDER_HISTORY', `Cleared ${ordersDeleteResult.affectedRows} orders.`);

            // Reset auto-increment ID for orders table
            try {
                await db.query('ALTER TABLE orders AUTO_INCREMENT = 1');
                console.log("Auto-increment ID for 'orders' table reset to 1.");
                await logActivity(businessId, userId, 'RESET_ORDER_ID_COUNTER', 'Order ID counter reset to 1 after clearing history.');
            } catch (resetError) {
                console.error("Failed to reset auto-increment ID:", resetError);
                await logActivity(businessId, userId, 'RESET_ORDER_ID_COUNTER_FAILED', `Failed to reset order ID counter. Error: ${resetError.message}`);
            }

            // Reset loyalty points for all customers for this business
            try {
                const [resetPointsResult] = await connection.query(
                    'UPDATE customers SET points = 0 WHERE business_id = ?',
                    [businessId]
                );
                console.log(`Loyalty points for ${resetPointsResult.affectedRows} customers reset to 0.`);
                await logActivity(businessId, userId, 'RESET_LOYALTY_POINTS', `Reset loyalty points for ${resetPointsResult.affectedRows} customers after clearing order history.`);
            } catch (resetPointsError) {
                console.error("Failed to reset loyalty points:", resetPointsError);
                await logActivity(businessId, userId, 'RESET_LOYALTY_POINTS_FAILED', `Failed to reset loyalty points after clearing history. Error: ${resetPointsError.message}`);
            }

            res.status(200).json({ message: 'Semua riwayat transaksi dan poin loyalitas pelanggan untuk bisnis Anda telah direset.' });

        } else {
            await connection.commit();
            console.log("No orders found to delete in this business.");
            res.status(200).json({ message: 'Tidak ada riwayat transaksi untuk dihapus.' });
        }
    } catch (error) {
        await connection.rollback();
        console.error("Error clearing history:", error);
        await logActivity(businessId, userId, 'CLEAR_ORDER_HISTORY_FAILED', `Failed to clear order history. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Gagal menghapus riwayat.' });
    } finally {
        connection.release();
    }
});

// DELETE /api/orders/:id - Menghapus pesanan tunggal dan mengembalikan stok
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const businessId = req.user.business_id;
        const userId = req.user.id;
        console.log(`Attempting to delete order ID: ${req.params.id} for business: ${businessId}`);

        const [orderItemsToRevert] = await connection.query(
             `SELECT oi.product_id, oi.quantity
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE o.id = ? AND o.business_id = ?`,
            [req.params.id, businessId]
        );

        if (orderItemsToRevert.length === 0) {
            await logActivity(businessId, userId, 'DELETE_ORDER_FAILED', `Attempted to delete non-existent or unauthorized order ID ${req.params.id}.`);
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        for (const item of orderItemsToRevert) {
            await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
        }

        await connection.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);

        const [result] = await connection.query('DELETE FROM orders WHERE id = ? AND business_id = ?', [req.params.id, businessId]);
        if (result.affectedRows === 0) {
            throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses setelah mencoba menghapus item.');
        }
        await connection.commit();
        await logActivity(businessId, userId, 'DELETE_ORDER', `Deleted order ID ${req.params.id}. Stock reverted. (Affected rows: ${result.affectedRows})`);
        res.json({ message: 'Pesanan berhasil dihapus.' });
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting order:", error);
        await logActivity(businessId, req.user.id, 'DELETE_ORDER_ERROR', `Error deleting order ID ${req.params.id}. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Gagal menghapus pesanan.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
