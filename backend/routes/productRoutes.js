// C:\Users\Ibnu\Project\smart-pos\backend\routes\productRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// --- Validation Rules ---
const productValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama produk tidak boleh kosong.').isLength({ max: 100 }).withMessage('Nama produk maksimal 100 karakter.'),
    body('stock').isNumeric().withMessage('Stok harus berupa angka.').isInt({ min: 0 }).withMessage('Stok tidak boleh negatif.'),
    body('low_stock_threshold').isNumeric().withMessage('Ambang batas stok rendah harus berupa angka.').isInt({ min: 0 }).withMessage('Ambang batas stok rendah tidak boleh negatif.'),
    body('variants').isArray({ min: 1 }).withMessage('Produk harus memiliki setidaknya satu varian.'),
    body('variants.*.name').trim().notEmpty().withMessage('Nama setiap varian tidak boleh kosong.').isLength({ max: 100 }).withMessage('Nama varian maksimal 100 karakter.'),
    body('variants.*.price').isNumeric().withMessage('Harga jual setiap varian harus berupa angka.').isFloat({ min: 0 }).withMessage('Harga jual tidak boleh negatif.'),
    body('variants.*.cost_price').isNumeric().withMessage('Harga beli (modal) setiap varian harus berupa angka.').isFloat({ min: 0 }).withMessage('Harga beli (modal) tidak boleh negatif.'),
    body('variants.*.barcode').optional({ checkFalsy: true }).isLength({ max: 50 }).withMessage('Barcode maksimal 50 karakter.'),
    body('recipeItems').optional().isArray().withMessage('Resep harus berupa array jika ada.'),
    body('recipeItems.*.raw_material_id').optional().isInt({ min: 1 }).withMessage('ID bahan baku resep tidak valid.'),
    body('recipeItems.*.quantity_used').optional().isFloat({ min: 0.01 }).withMessage('Jumlah bahan baku yang digunakan harus angka positif.')
];

const receiveStockValidationRules = [
    body('items').isArray({ min: 1 }).withMessage('Daftar item untuk penambahan stok harus diisi.'),
    body('items.*.productId').isInt({ min: 1 }).withMessage('ID produk tidak valid.'),
    body('items.*.quantity').isInt({ min: 0 }).withMessage('Kuantitas harus angka non-negatif.'),
    body('purchase_order_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('ID pesanan pembelian tidak valid.')
];

// --- Product Endpoints ---

// POST /api/products (Create a new product)
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
        const [[existingProduct]] = await connection.query('SELECT id FROM products WHERE business_id = ? AND name = ? AND is_archived = 0', [businessId, name]);
        if (existingProduct) {
            await connection.rollback();
            return res.status(409).json({ message: 'Nama produk sudah ada.' });
        }
        const productSql = 'INSERT INTO products (business_id, name, description, category_id, sub_category_id, supplier_id, stock, image_url, expiration_date, low_stock_threshold) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [productResult] = await connection.query(productSql, [businessId, name, description || null, category_id || null, sub_category_id || null, supplier_id || null, stock, image_url || null, expiration_date || null, low_stock_threshold || 5]);
        const productId = productResult.insertId;
        for (const variant of variants) {
            const variantSql = 'INSERT INTO product_variants (product_id, name, price, cost_price, barcode) VALUES (?, ?, ?, ?, ?)';
            await connection.query(variantSql, [productId, variant.name, variant.price, variant.cost_price, variant.barcode || null]);
        }
        if (recipeItems && Array.isArray(recipeItems) && recipeItems.length > 0) {
            for (const item of recipeItems) {
                const [[rawMaterial]] = await connection.query('SELECT id FROM raw_materials WHERE id = ? AND business_id = ?', [item.raw_material_id, businessId]);
                if (!rawMaterial) {
                    await connection.rollback();
                    return res.status(400).json({ message: `Bahan baku dengan ID ${item.raw_material_id} tidak ditemukan.` });
                }
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
        if (connection) connection.release();
    }
});

// GET /api/products/:id (Get a single product)
router.get('/:id', protect, async (req, res) => {
    try {
        const productId = req.params.id;
        const businessId = req.user.business_id;
        const productSql = `
            SELECT
                p.id, p.name, p.description, p.category_id, p.sub_category_id, p.supplier_id,
                p.stock, p.image_url, p.expiration_date, p.low_stock_threshold, p.created_at,
                c.name AS category_name,
                sc.name AS sub_category_name,
                s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ? AND p.business_id = ? AND p.is_archived = 0`;
        const [[product]] = await db.query(productSql, [productId, businessId]);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        const variantsSql = `SELECT id, product_id, name, price, cost_price, barcode FROM product_variants WHERE product_id = ?`;
        const [variants] = await db.query(variantsSql, [productId]);
        product.variants = variants;
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

// PUT /api/products/:id (Update a product)
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
        const [[originalProduct]] = await connection.query('SELECT name FROM products WHERE id = ? AND business_id = ? AND is_archived = 0', [productId, businessId]);
        if (!originalProduct) {
            await connection.rollback();
            return res.status(404).json({ message: 'Produk tidak ditemukan atau Anda tidak memiliki akses.' });
        }
        if (originalProduct.name !== name) {
            const [[duplicateNameProduct]] = await connection.query('SELECT id FROM products WHERE business_id = ? AND name = ? AND id != ? AND is_archived = 0', [businessId, name, productId]);
            if (duplicateNameProduct) {
                await connection.rollback();
                return res.status(409).json({ message: 'Nama produk sudah digunakan oleh produk lain.' });
            }
        }
        const productSql = 'UPDATE products SET name = ?, description = ?, category_id = ?, sub_category_id = ?, supplier_id = ?, stock = ?, image_url = ?, expiration_date = ?, low_stock_threshold = ? WHERE id = ? AND business_id = ?';
        await connection.query(productSql, [name, description || null, category_id || null, sub_category_id || null, supplier_id || null, stock, image_url || null, expiration_date || null, low_stock_threshold || 5, productId, businessId]);
        await connection.query('DELETE FROM product_variants WHERE product_id = ?', [productId]);
        await connection.query('DELETE FROM recipes WHERE product_id = ?', [productId]);
        for (const variant of variants) {
            const variantSql = 'INSERT INTO product_variants (product_id, name, price, cost_price, barcode) VALUES (?, ?, ?, ?, ?)';
            await connection.query(variantSql, [productId, variant.name, variant.price, variant.cost_price, variant.barcode || null]);
        }
        if (recipeItems && Array.isArray(recipeItems) && recipeItems.length > 0) {
            for (const item of recipeItems) {
                const [[rawMaterial]] = await connection.query('SELECT id FROM raw_materials WHERE id = ? AND business_id = ?', [item.raw_material_id, businessId]);
                if (!rawMaterial) {
                    await connection.rollback();
                    return res.status(400).json({ message: `Bahan baku dengan ID ${item.raw_material_id} tidak ditemukan.` });
                }
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
        if (connection) connection.release();
    }
});

// GET /api/products (Get all products) - DIKEMBALIKAN KE VERSI AWAL
router.get('/', protect, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const { search, barcode } = req.query;
        let productsSql;
        let params = [];

        if (barcode) {
            productsSql = `SELECT p.* FROM products p 
                          JOIN product_variants pv ON p.id = pv.product_id 
                          WHERE pv.barcode = ? AND p.business_id = ? AND p.is_archived = 0`;
            params = [barcode, businessId];
        } else {
            productsSql = `
                SELECT
                    p.id, p.name, p.description, p.image_url, p.category_id, p.sub_category_id,
                    p.supplier_id, p.stock, p.expiration_date, p.low_stock_threshold, p.created_at,
                    c.name AS category_name,
                    sc.name AS sub_category_name,
                    s.name as supplier_name
                FROM products AS p
                LEFT JOIN categories AS c ON p.category_id = c.id
                LEFT JOIN sub_categories AS sc ON p.sub_category_id = sc.id
                LEFT JOIN suppliers AS s ON p.supplier_id = s.id
                WHERE p.business_id = ? AND p.is_archived = 0
            `;
            params = [businessId];

            if (search && search.trim() !== '') {
                productsSql += ` AND (p.name LIKE ? OR EXISTS (
                                 SELECT 1 FROM product_variants pv_search WHERE pv_search.product_id = p.id AND pv_search.barcode = ?
                               ))`;
                const searchTerm = `%${search.trim()}%`;
                params.push(searchTerm, search.trim());
            }

            productsSql += ' GROUP BY p.id ORDER BY p.created_at DESC';
        }
        
        const [products] = await db.query(productsSql, params);

        if (products.length > 0) {
            const productIds = products.map(p => p.id);
            const variantsSql = `SELECT id, product_id, name, price, cost_price, barcode FROM product_variants WHERE product_id IN (?)`;
            const [variants] = await db.query(variantsSql, [productIds]);
            
            // Gabungkan varian ke setiap produk di JavaScript
            const productsWithVariants = products.map(product => ({
                ...product,
                variants: variants.filter(variant => variant.product_id === product.id)
            }));
            res.json(productsWithVariants);
        } else {
            res.json([]);
        }

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
// --- AKHIR PERBAIKAN ---


// DELETE /api/products/:id (Archive a product)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const productId = req.params.id;
    const businessId = req.user.business_id;
    try {
        const [[productName]] = await db.query('SELECT name FROM products WHERE id = ? AND business_id = ? AND is_archived = 0', [productId, businessId]);
        if (!productName) {
            return res.status(404).json({ message: 'Produk tidak ditemukan atau Anda tidak punya akses.' });
        }
        const [result] = await db.query('UPDATE products SET is_archived = 1 WHERE id = ? AND business_id = ?', [productId, businessId]);
        if (result.affectedRows === 0) {
            throw new Error('Failed to archive product, possibly concurrency issue.');
        }
        await logActivity(businessId, req.user.id, 'ARCHIVE_PRODUCT', `Archived product: ${productName.name} (ID: ${productId}).`);
        res.json({ message: 'Produk berhasil diarsipkan.' });
    } catch (error) {
        console.error('Error archiving product:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST /api/products/receive-stock
router.post('/receive-stock', protect, isAdmin, receiveStockValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { items, purchase_order_id } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    const productIds = items.map(item => item.productId);
    if (productIds.length === 0) {
        return res.status(400).json({ message: 'Daftar item tidak boleh kosong.' });
    }

    try {
        const [validProducts] = await db.query(
            'SELECT id FROM products WHERE business_id = ? AND is_archived = 0 AND id IN (?)',
            [businessId, productIds]
        );
        const validProductIds = new Set(validProducts.map(p => p.id));
        const invalidProductIds = productIds.filter(id => !validProductIds.has(parseInt(id)));

        if (invalidProductIds.length > 0) {
            return res.status(404).json({
                message: `Beberapa produk tidak ditemukan atau bukan milik bisnis Anda. ID tidak valid: [${invalidProductIds.join(', ')}]`,
            });
        }

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            for (const item of items) {
                await connection.query(
                    'UPDATE products SET stock = stock + ? WHERE id = ?',
                    [parseInt(item.quantity, 10), item.productId]
                );
            }

            if (purchase_order_id) {
                await connection.query(
                    'UPDATE purchase_orders SET status = "COMPLETED" WHERE id = ? AND business_id = ?',
                    [purchase_order_id, businessId]
                );
                await logActivity(businessId, userId, 'PO_COMPLETED', `Purchase Order ID ${purchase_order_id} ditandai selesai via penerimaan stok.`);
            }

            await connection.commit();
            const itemDetails = items.map(i => `(ID: ${i.productId}, Qty: ${i.quantity})`).join(', ');
            await logActivity(businessId, userId, 'RECEIVE_STOCK', `Stok diterima untuk item: ${itemDetails}${purchase_order_id ? ` (PO: ${purchase_order_id})` : ''}`);
            res.status(200).json({ message: 'Stok berhasil diperbarui untuk semua produk.' });

        } catch (error) {
            await connection.rollback();
            console.error('Error in transaction while receiving stock:', error);
            await logActivity(businessId, userId, 'RECEIVE_STOCK_FAILED_TRANSACTION', `Error: ${error.message}`);
            res.status(500).json({ message: error.message || 'Gagal memperbarui stok saat transaksi.' });
        } finally {
            if (connection) connection.release();
        }

    } catch (error) {
        console.error('Error validating products before receiving stock:', error);
        await logActivity(businessId, userId, 'RECEIVE_STOCK_FAILED_VALIDATION', `Error: ${error.message}`);
        res.status(500).json({ message: error.message || 'Gagal memvalidasi produk.' });
    }
});

module.exports = router;