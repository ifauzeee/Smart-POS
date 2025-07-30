const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator'); // Import validator
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak.' });
    }
    next();
};

// Define validation rules for products
const productValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama produk tidak boleh kosong.'),
    body('stock')
        .isNumeric().withMessage('Stok harus berupa angka.')
        .isInt({ min: 0 }).withMessage('Stok tidak boleh negatif.'),
    body('low_stock_threshold')
        .isNumeric().withMessage('Ambang batas stok rendah harus berupa angka.')
        .isInt({ min: 0 }).withMessage('Ambang batas stok rendah tidak boleh negatif.'),
    body('variants').isArray({ min: 1 }).withMessage('Produk harus memiliki setidaknya satu varian.'),
    body('variants.*.name').trim().notEmpty().withMessage('Nama setiap varian tidak boleh kosong.'),
    body('variants.*.price')
        .isNumeric().withMessage('Harga jual setiap varian harus berupa angka.')
        .isFloat({ min: 0 }).withMessage('Harga jual tidak boleh negatif.'),
    body('variants.*.cost_price')
        .isNumeric().withMessage('Harga beli (modal) setiap varian harus berupa angka.')
        .isFloat({ min: 0 }).withMessage('Harga beli (modal) tidak boleh negatif.'),
    // Optional: Validate recipeItems if present
    body('recipeItems.*.raw_material_id').optional().isInt({ min: 1 }).withMessage('ID bahan baku resep tidak valid.'),
    body('recipeItems.*.quantity_used')
        .optional()
        .isFloat({ min: 0.01 }).withMessage('Jumlah bahan baku yang digunakan harus angka positif.')
];

// CREATE: Menambah produk baru dengan validasi
router.post('/', protect, isAdmin, productValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date, variants, low_stock_threshold, recipeItems } = req.body;
    const businessId = req.user.business_id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const productSql = 'INSERT INTO products (business_id, name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [productResult] = await connection.query(productSql, [businessId, name, description || null, category_id || null, sub_category_id || null, supplier_id || null, stock, image_url || null, expiration_date || null, low_stock_threshold || 5]);
        const productId = productResult.insertId;

        for (const variant of variants) {
            const variantSql = 'INSERT INTO product_variants (product_id, name, price, cost_price, barcode) VALUES (?, ?, ?, ?, ?)';
            await connection.query(variantSql, [productId, variant.name, variant.price, variant.cost_price, variant.barcode || null]);
        }

        if (recipeItems && Array.isArray(recipeItems) && recipeItems.length > 0) {
            for (const item of recipeItems) {
                const recipeSql = 'INSERT INTO recipes (product_id, raw_material_id, quantity_used) VALUES (?, ?, ?)';
                await connection.query(recipeSql, [productId, item.raw_material_id, item.quantity_used]);
            }
        }

        await connection.commit();
        await logActivity(businessId, req.user.id, 'CREATE_PRODUCT', `Created product: ${name} (ID: ${productId}).`);
        res.status(201).json({ message: 'Produk berhasil ditambahkan!', productId });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating product:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        connection.release();
    }
});

// READ ONE: Mengambil satu produk beserta resepnya
router.get('/:id', protect, async (req, res) => {
    try {
        const productId = req.params.id;
        const businessId = req.user.business_id;
        
        // Query untuk detail produk
        const productSql = `SELECT p.* FROM products p WHERE p.id = ? AND p.business_id = ? AND p.is_archived = 0`;
        const [[product]] = await db.query(productSql, [productId, businessId]);

        if (!product) { 
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        // Query untuk varian
        const variantsSql = `SELECT * FROM product_variants WHERE product_id = ?`;
        const [variants] = await db.query(variantsSql, [productId]);
        product.variants = variants;

        // Ambil data resep
        const recipeSql = `
            SELECT r.raw_material_id, r.quantity_used, rm.name as raw_material_name, rm.unit as raw_material_unit
            FROM recipes r
            JOIN raw_materials rm ON r.raw_material_id = rm.id
            WHERE r.product_id = ?
        `;
        const [recipeItems] = await db.query(recipeSql, [productId]);
        product.recipeItems = recipeItems;

        res.json(product);

    } catch (error) {
        console.error('Error fetching single product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// UPDATE: Memperbarui produk dengan resep dan validasi
router.put('/:id', protect, isAdmin, productValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const { name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date, variants, low_stock_threshold, recipeItems } = req.body;
    const businessId = req.user.business_id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const productSql = 'UPDATE products SET name = ?, description = ?, category_id = ?, sub_category_id = ?, supplier_id = ?, stock = ?, image_url = ?, expiration_date = ?, low_stock_threshold = ? WHERE id = ? AND business_id = ?';
        await connection.query(productSql, [name, description || null, category_id || null, sub_category_id || null, supplier_id || null, stock, image_url || null, expiration_date || null, low_stock_threshold || 5, productId, businessId]);

        // Hapus varian lama dan resep lama, lalu masukkan yang baru
        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
        await connection.query('DELETE FROM recipes WHERE product_id = ?', [productId]); // Hapus resep lama

        for (const variant of variants) {
            const variantSql = 'INSERT INTO product_variants (product_id, name, price, cost_price, barcode) VALUES (?, ?, ?, ?, ?)';
            await connection.query(variantSql, [productId, variant.name, variant.price, variant.cost_price, variant.barcode || null]);
        }

        if (recipeItems && Array.isArray(recipeItems) && recipeItems.length > 0) {
            for (const item of recipeItems) {
                const recipeSql = 'INSERT INTO recipes (product_id, raw_material_id, quantity_used) VALUES (?, ?, ?)';
                await connection.query(recipeSql, [productId, item.raw_material_id, item.quantity_used]);
            }
        }

        await connection.commit();
        await logActivity(businessId, req.user.id, 'UPDATE_PRODUCT', `Updated product: ${name} (ID: ${productId}).`);
        res.json({ message: 'Produk berhasil diperbarui!' });

    } catch (error) {
        await connection.rollback();
        console.error("Error updating product:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    } finally {
        connection.release();
    }
});


// READ ALL: Mengambil semua produk
router.get('/', protect, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { barcode } = req.query;

        let productsSql;
        let params = [];

        if (barcode) {
            productsSql = `
                SELECT p.* FROM products p 
                JOIN product_variants pv ON p.id = pv.product_id 
                WHERE pv.barcode = ? AND p.business_id = ? AND p.is_archived = 0
            `;
            params = [barcode, businessId];
        } else {
            productsSql = `
                SELECT 
                    p.id, p.name, p.description, p.image_url, p.category_id, p.sub_category_id, p.supplier_id, p.stock, p.expiration_date, p.low_stock_threshold,
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

// DELETE: Mengarsipkan produk (Soft Delete)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const productId = req.params.id;
    const businessId = req.user.business_id;
    try {
        const [result] = await db.query('UPDATE products SET is_archived = 1 WHERE id = ? AND business_id = ?', [productId, businessId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan atau Anda tidak punya akses.' });
        }
        
        await logActivity(businessId, req.user.id, 'DELETE_PRODUCT', `Archived product ID: ${productId}`);
        res.json({ message: 'Produk berhasil diarsipkan.' });
    } catch (error) {
        console.error('Error archiving product:', error);
        res.status(500).json({ message: 'Server Error' });
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
