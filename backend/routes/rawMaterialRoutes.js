const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated: Import isAdmin
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator'); // Import validator

const router = express.Router();

// The local isAdmin function has been removed from here.
// It should now be defined and exported from '../middleware/authMiddleware.js'.

// --- Validation Rules ---

const rawMaterialValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama bahan baku tidak boleh kosong.')
        .isLength({ max: 100 }).withMessage('Nama bahan baku maksimal 100 karakter.'),
    body('stock_quantity')
        .notEmpty().withMessage('Kuantitas stok tidak boleh kosong.')
        .isFloat({ min: 0 }).withMessage('Kuantitas stok harus berupa angka non-negatif.'),
    body('unit')
        .trim()
        .notEmpty().withMessage('Unit bahan baku tidak boleh kosong.')
        .isLength({ max: 50 }).withMessage('Unit bahan baku maksimal 50 karakter.'),
    body('cost_per_unit')
        .notEmpty().withMessage('Harga beli per unit tidak boleh kosong.')
        .isFloat({ gt: 0 }).withMessage('Harga beli per unit harus berupa angka positif.')
];

// --- Raw Material Endpoints ---

/**
 * @route GET /api/raw-materials
 * @desc Get all raw materials for the business
 * @access Private (Admin only)
 */
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [materials] = await db.query(
            'SELECT id, name, stock_quantity, unit, cost_per_unit, created_at, updated_at FROM raw_materials WHERE business_id = ? ORDER BY name ASC',
            [businessId]
        );
        res.json(materials);
    } catch (error) {
        console.error('Error fetching raw materials:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route GET /api/raw-materials/:id
 * @desc Get a single raw material by ID
 * @access Private (Admin only)
 */
router.get('/:id', protect, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const businessId = req.user.business_id;

        const [[material]] = await db.query(
            'SELECT id, name, stock_quantity, unit, cost_per_unit, created_at, updated_at FROM raw_materials WHERE id = ? AND business_id = ?',
            [id, businessId]
        );

        if (!material) {
            return res.status(404).json({ message: 'Bahan baku tidak ditemukan atau Anda tidak memiliki akses.' });
        }
        res.json(material);
    } catch (error) {
        console.error('Error fetching single raw material:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


/**
 * @route POST /api/raw-materials
 * @desc Create a new raw material
 * @access Private (Admin only)
 */
router.post('/', protect, isAdmin, rawMaterialValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, stock_quantity, unit, cost_per_unit } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Check for duplicate name within the same business
        const [[existingMaterial]] = await db.query('SELECT id FROM raw_materials WHERE business_id = ? AND name = ?', [businessId, name]);
        if (existingMaterial) {
            return res.status(409).json({ message: 'Nama bahan baku sudah ada.' });
        }

        const [result] = await db.query(
            'INSERT INTO raw_materials (business_id, name, stock_quantity, unit, cost_per_unit) VALUES (?, ?, ?, ?, ?)',
            [businessId, name, stock_quantity, unit, cost_per_unit]
        );
        const materialId = result.insertId;
        await logActivity(businessId, userId, 'CREATE_RAW_MATERIAL', `Membuat bahan baku: ${name} (ID: ${materialId}).`);
        res.status(201).json({ message: 'Bahan baku berhasil ditambahkan!', materialId });
    } catch (error) {
        console.error('Error creating raw material:', error);
        await logActivity(businessId, userId, 'CREATE_RAW_MATERIAL_FAILED', `Gagal membuat bahan baku ${name}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route PUT /api/raw-materials/:id
 * @desc Update an existing raw material
 * @access Private (Admin only)
 */
router.put('/:id', protect, isAdmin, rawMaterialValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, stock_quantity, unit, cost_per_unit } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Verify raw material exists and belongs to the current business
        const [[originalMaterial]] = await db.query('SELECT name FROM raw_materials WHERE id = ? AND business_id = ?', [id, businessId]);
        if (!originalMaterial) {
            return res.status(404).json({ message: 'Bahan baku tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        // Check for duplicate name if changing
        if (originalMaterial.name !== name) {
            const [[duplicateNameMaterial]] = await db.query('SELECT id FROM raw_materials WHERE business_id = ? AND name = ? AND id != ?', [businessId, name, id]);
            if (duplicateNameMaterial) {
                return res.status(409).json({ message: 'Nama bahan baku sudah digunakan oleh bahan baku lain.' });
            }
        }

        const [result] = await db.query(
            'UPDATE raw_materials SET name = ?, stock_quantity = ?, unit = ?, cost_per_unit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?',
            [name, stock_quantity, unit, cost_per_unit, id, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(200).json({ message: 'Bahan baku ditemukan tetapi tidak ada perubahan yang dibuat.' });
        }
        await logActivity(businessId, userId, 'UPDATE_RAW_MATERIAL', `Memperbarui bahan baku: ${name} (ID: ${id}).`);
        res.json({ message: 'Bahan baku berhasil diperbarui.' });
    } catch (error) {
        console.error('Error updating raw material:', error);
        await logActivity(businessId, userId, 'UPDATE_RAW_MATERIAL_FAILED', `Gagal memperbarui bahan baku ID ${id}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route DELETE /api/raw-materials/:id
 * @desc Delete a raw material
 * @access Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const { id } = req.params;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Get raw material name for logging before deletion
        const [[materialName]] = await db.query('SELECT name FROM raw_materials WHERE id = ? AND business_id = ?', [id, businessId]);
        if (!materialName) {
            return res.status(404).json({ message: 'Bahan baku tidak ditemukan atau Anda tidak punya akses.' });
        }

        // Check if raw material is used in any recipes
        const [[inRecipe]] = await db.query('SELECT COUNT(*) as count FROM recipes WHERE raw_material_id = ?', [id]);
        if (inRecipe.count > 0) {
            return res.status(400).json({ message: 'Bahan baku tidak bisa dihapus karena masih digunakan dalam resep produk.' });
        }

        const [result] = await db.query(
            'DELETE FROM raw_materials WHERE id = ? AND business_id = ?',
            [id, businessId]
        );

        if (result.affectedRows === 0) {
            // This case might be hit if the raw material somehow disappeared between the initial SELECT and DELETE
            throw new Error('Gagal menghapus bahan baku, kemungkinan masalah konkurensi.');
        }
        await logActivity(businessId, userId, 'DELETE_RAW_MATERIAL', `Menghapus bahan baku: ${materialName.name} (ID: ${id}).`);
        res.json({ message: 'Bahan baku berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting raw material:', error);
        await logActivity(businessId, userId, 'DELETE_RAW_MATERIAL_FAILED', `Gagal menghapus bahan baku ID ${id}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;