const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    next();
};

// CREATE: Menambah produk baru dengan stok terpusat
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date, variants } = req.body;
    const businessId = req.user.business_id;

    if (!name || !variants || variants.length === 0) {
        return res.status(400).json({ message: 'Nama produk dan setidaknya satu varian harus diisi.' });
    }
    if (stock === undefined || stock === null || isNaN(parseInt(stock))) {
        return res.status(400).json({ message: 'Total stok harus diisi dengan angka yang valid.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const finalCategoryId = category_id || null;
        const finalSubCategoryId = sub_category_id || null;
        const finalSupplierId = supplier_id || null;
        const finalExpirationDate = expiration_date || null;

        const productSql = 'INSERT INTO products (business_id, name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [productResult] = await connection.query(productSql, [businessId, name, description || null, finalCategoryId, finalSubCategoryId, finalSupplierId, stock, image_url || null, finalExpirationDate]);
        const productId = productResult.insertId;

        for (const variant of variants) {
            if (!variant.name || variant.price === undefined || variant.cost_price === undefined) {
                throw new Error('Setiap varian harus memiliki nama, harga, dan harga beli.');
            }
            const variantSql = 'INSERT INTO product_variants (product_id, name, price, cost_price, barcode) VALUES (?, ?, ?, ?, ?)';
            await connection.query(variantSql, [productId, variant.name, variant.price, variant.cost_price, variant.barcode || null]);
        }

        await connection.commit();
        await logActivity(businessId, req.user.id, 'CREATE_PRODUCT', `Created product: ${name} (ID: ${productId}).`);
        res.status(201).json({ message: 'Produk berhasil ditambahkan!', productId });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating product:', error);
        await logActivity(businessId, req.user.id, 'CREATE_PRODUCT_FAILED', `Failed to create product ${name}. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        connection.release();
    }
});

// READ ALL: Mengambil semua produk ATAU satu produk via barcode (yang tidak diarsipkan)
router.get('/', protect, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { barcode } = req.query; // Ambil parameter barcode dari query

        let productsSql;
        let params = [];

        if (barcode) {
            // Jika ada parameter barcode, cari produk spesifik berdasarkan barcode variannya
            productsSql = `
                SELECT p.* FROM products p 
                JOIN product_variants pv ON p.id = pv.product_id 
                WHERE pv.barcode = ? AND p.business_id = ? AND p.is_archived = 0
            `;
            params = [barcode, businessId];
        } else {
            // Jika tidak ada, ambil semua produk seperti biasa (yang tidak diarsipkan)
            productsSql = `
                SELECT 
                    p.id, p.name, p.description, p.image_url, p.category_id, p.sub_category_id, p.supplier_id, p.stock, p.expiration_date,
                    c.name AS category_name,
                    sc.name AS sub_category_name,
                    s.name as supplier_name
                FROM products AS p
                LEFT JOIN categories AS c ON p.category_id = c.id
                LEFT JOIN sub_categories AS sc ON p.sub_category_id = sc.id
                LEFT JOIN suppliers AS s ON p.supplier_id = s.id
                WHERE p.business_id = ? AND p.is_archived = 0
                ORDER BY p.created_at DESC
            `;
            params = [businessId];
        }
        
        const [products] = await db.query(productsSql, params);

        if (products.length > 0) {
            const productIds = products.map(p => p.id);
            const variantsSql = `SELECT id, product_id, name, price, cost_price, barcode FROM product_variants WHERE product_id IN (?)`;
            const [variants] = await db.query(variantsSql, [productIds]);
            products.forEach(p => {
                p.variants = variants.filter(v => v.product_id === p.id);
            });
        }
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// READ ONE: Mengambil satu produk berdasarkan ID (termasuk yang diarsipkan jika diperlukan di masa depan, tapi saat ini hanya yang aktif)
router.get('/:id', protect, async (req, res) => {
    try {
        const productId = req.params.id;
        const businessId = req.user.business_id;
        const productSql = `
            SELECT 
                p.id, p.name, p.description, p.image_url, p.category_id, p.sub_category_id, p.supplier_id, p.stock, p.expiration_date, p.is_archived,
                c.name AS category_name,
                sc.name AS sub_category_name,
                s.name as supplier_name
            FROM products AS p
            LEFT JOIN categories AS c ON p.category_id = c.id
            LEFT JOIN sub_categories AS sc ON p.sub_category_id = sc.id
            LEFT JOIN suppliers AS s ON p.supplier_id = s.id
            WHERE p.id = ? AND p.business_id = ?
        `;
        const [[product]] = await db.query(productSql, [productId, businessId]);

        if (!product) { 
            return res.status(404).json({ message: 'Produk tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        const variantsSql = `SELECT id, product_id, name, price, cost_price, barcode FROM product_variants WHERE product_id = ?`;
        const [variants] = await db.query(variantsSql, [productId]);
        product.variants = variants;

        res.json(product);

    } catch (error) {
        console.error('Error fetching single product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// UPDATE: Memperbarui produk dengan stok terpusat
router.put('/:id', protect, isAdmin, async (req, res) => {
    const productId = req.params.id;
    const { name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date, variants } = req.body;
    const businessId = req.user.business_id;

    if (!name || !variants || variants.length === 0 || stock === undefined) {
        return res.status(400).json({ message: 'Data produk tidak lengkap.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const finalCategoryId = category_id || null;
        const finalSubCategoryId = sub_category_id || null;
        const finalSupplierId = supplier_id || null;
        const finalExpirationDate = expiration_date || null;

        const productSql = 'UPDATE products SET name = ?, description = ?, category_id = ?, sub_category_id = ?, supplier_id = ?, stock = ?, image_url = ?, expiration_date = ? WHERE id = ? AND business_id = ?';
        await connection.query(productSql, [name, description || null, finalCategoryId, finalSubCategoryId, finalSupplierId, stock, image_url || null, finalExpirationDate, productId, businessId]);

        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);

        for (const variant of variants) {
            if (!variant.name || variant.price === undefined || variant.cost_price === undefined) {
                throw new Error('Setiap varian harus memiliki nama, harga, dan harga beli.');
            }
            const variantSql = 'INSERT INTO product_variants (product_id, name, price, cost_price, barcode) VALUES (?, ?, ?, ?, ?)';
            await connection.query(variantSql, [productId, variant.name, variant.price, variant.cost_price, variant.barcode || null]);
        }

        await connection.commit();
        await logActivity(businessId, req.user.id, 'UPDATE_PRODUCT', `Updated product: ${name} (ID: ${productId}).`);
        res.json({ message: 'Produk berhasil diperbarui!' });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating product:", error);
        await logActivity(businessId, req.user.id, 'UPDATE_PRODUCT_FAILED', `Failed to update product ID ${productId}. Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        connection.release();
    }
});

// DELETE (Soft Delete): Mengarsipkan produk
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const productId = req.params.id;
    const businessId = req.user.business_id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Perubahan di sini: Update is_archived menjadi 1
        const [result] = await connection.query('UPDATE products SET is_archived = 1 WHERE id = ? AND business_id = ?', [productId, businessId]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Produk tidak ditemukan atau Anda tidak punya akses.' });
        }
        
        await connection.commit();
        await logActivity(businessId, req.user.id, 'ARCHIVE_PRODUCT', `Archived product ID: ${productId}`);
        res.json({ message: 'Produk berhasil diarsipkan.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error archiving product:', error);
        // Pesan error ini mungkin perlu disesuaikan karena produk tidak benar-benar dihapus
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
});

// CREATE: Menambah stok ke produk yang ada
router.post('/receive-stock', protect, isAdmin, async (req, res) => {
    const { items } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Daftar item untuk penambahan stok harus diisi.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        for (const item of items) {
            const { productId, quantity } = item;
            if (!productId || !quantity || parseInt(quantity) <= 0) {
                throw new Error(`Data tidak valid untuk produk ID ${productId}. Kuantitas harus lebih dari 0.`);
            }
            
            await connection.query(
                'UPDATE products SET stock = stock + ? WHERE id = ? AND business_id = ?',
                [parseInt(quantity), productId, businessId]
            );
        }

        await connection.commit();

        const itemDetails = items.map(i => `(ID: ${i.productId}, Qty: ${i.quantity})`).join(', ');
        await logActivity(businessId, userId, 'RECEIVE_STOCK', `Stock received for items: ${itemDetails}`);

        res.status(200).json({ message: 'Stok berhasil diperbarui untuk semua produk.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error receiving stock:', error);
        await logActivity(businessId, userId, 'RECEIVE_STOCK_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Gagal memperbarui stok.' });
    } finally {
        connection.release();
    }
});

module.exports = router;