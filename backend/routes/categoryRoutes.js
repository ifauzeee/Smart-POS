const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Updated: Import isAdmin
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// --- Validation Rules ---

// Define validation rules for Category
const categoryValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama kategori tidak boleh kosong.')
        .isLength({ min: 3 }).withMessage('Nama kategori minimal 3 karakter.')
        .isLength({ max: 50 }).withMessage('Nama kategori maksimal 50 karakter.') // Added max length
];

// Define validation rules for Sub-category
const subCategoryValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama sub-kategori tidak boleh kosong.')
        .isLength({ min: 3 }).withMessage('Nama sub-kategori minimal 3 karakter.')
        .isLength({ max: 50 }).withMessage('Nama sub-kategori maksimal 50 karakter.') // Added max length
];

// --- Category Endpoints ---

/**
 * @route POST /api/categories
 * @desc Create a new category
 * @access Private (Admin only)
 */
router.post('/', protect, isAdmin, categoryValidationRules, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const businessId = req.user.business_id;

    try {
        // Check if category name already exists for this business
        const [[existingCategory]] = await db.query('SELECT id FROM categories WHERE business_id = ? AND name = ?', [businessId, name]);
        if (existingCategory) {
            return res.status(409).json({ message: 'Nama kategori sudah ada.' });
        }

        const [result] = await db.query('INSERT INTO categories (business_id, name) VALUES (?, ?)', [businessId, name]);
        const categoryId = result.insertId;
        await logActivity(businessId, req.user.id, 'CREATE_CATEGORY', `Created category: ${name} (ID: ${categoryId}).`);
        res.status(201).json({ message: 'Kategori berhasil ditambahkan!', categoryId });
    } catch (error) {
        console.error('Error creating category:', error);
        await logActivity(businessId, req.user.id, 'CREATE_CATEGORY_FAILED', `Failed to create category ${name}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route GET /api/categories
 * @desc Read all categories for the business
 * @access Private (Authenticated users)
 */
router.get('/', protect, async (req, res) => {
    const businessId = req.user.business_id;
    try {
        const [categories] = await db.query('SELECT id, name FROM categories WHERE business_id = ? ORDER BY name ASC', [businessId]);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route PUT /api/categories/:id
 * @desc Update an existing category
 * @access Private (Admin only)
 */
router.put('/:id', protect, isAdmin, categoryValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.id;
    const { name } = req.body;
    const businessId = req.user.business_id;

    try {
        // Check if category exists and belongs to the business
        const [[existingCategory]] = await db.query('SELECT name FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        // Check if the new name already exists for another category in the same business
        const [[duplicateName]] = await db.query('SELECT id FROM categories WHERE business_id = ? AND name = ? AND id != ?', [businessId, name, categoryId]);
        if (duplicateName) {
            return res.status(409).json({ message: 'Nama kategori sudah digunakan oleh kategori lain.' });
        }

        const [result] = await db.query(
            'UPDATE categories SET name = ? WHERE id = ? AND business_id = ?',
            [name, categoryId, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau tidak ada perubahan.' });
        }

        await logActivity(businessId, req.user.id, 'UPDATE_CATEGORY', `Updated category from "${existingCategory.name}" to "${name}" (ID: ${categoryId}).`);
        res.json({ message: 'Kategori berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating category:', error);
        await logActivity(businessId, req.user.id, 'UPDATE_CATEGORY_FAILED', `Failed to update category ID ${categoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category and its associated sub-categories, unlinking products
 * @access Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const categoryId = req.params.id;
    const businessId = req.user.business_id;
    const connection = await db.getConnection(); // Get a connection for transaction
    try {
        await connection.beginTransaction();

        // Get category name for logging before deletion
        const [[categoryName]] = await connection.query('SELECT name FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        if (!categoryName) {
            await logActivity(businessId, req.user.id, 'DELETE_CATEGORY_FAILED', `Attempted to delete non-existent or unauthorized category ID ${categoryId}.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak punya akses.' });
        }

        // Unlink products from this category and its sub-categories
        await connection.query('UPDATE products SET category_id = NULL WHERE category_id = ? AND business_id = ?', [categoryId, businessId]);
        await connection.query('UPDATE products SET sub_category_id = NULL WHERE sub_category_id IN (SELECT id FROM sub_categories WHERE category_id = ?) AND business_id = ?', [categoryId, businessId]);

        // Delete all sub-categories belonging to this category
        await connection.query('DELETE FROM sub_categories WHERE category_id = ? AND business_id = ?', [categoryId, businessId]);

        // Delete the category itself
        const [result] = await connection.query('DELETE FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);

        if (result.affectedRows === 0) {
            // This case might be hit if the category somehow disappeared between the initial SELECT and DELETE
            throw new Error('Failed to delete category, possibly concurrency issue or not found during final delete.');
        }

        await connection.commit(); // Commit the transaction
        await logActivity(businessId, req.user.id, 'DELETE_CATEGORY', `Deleted category: ${categoryName.name} (ID: ${categoryId}).`);
        res.json({ message: 'Kategori dan sub-kategorinya berhasil dihapus.' });
    } catch (error) {
        await connection.rollback(); // Rollback on error
        console.error('Error deleting category:', error);
        await logActivity(businessId, req.user.id, 'DELETE_CATEGORY_FAILED', `Failed to delete category ID ${categoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
});

// --- Sub-Category Endpoints ---

/**
 * @route GET /api/categories/:categoryId/subcategories
 * @desc Read all sub-categories for a specific category
 * @access Private (Authenticated users)
 */
router.get('/:categoryId/subcategories', protect, async (req, res) => {
    const categoryId = req.params.categoryId;
    const businessId = req.user.business_id;
    try {
        // Optional: Check if the category exists and belongs to the business for stricter access control
        const [[categoryExists]] = await db.query('SELECT id FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        const [subCategories] = await db.query(
            'SELECT id, name FROM sub_categories WHERE category_id = ? AND business_id = ? ORDER BY name ASC',
            [categoryId, businessId]
        );
        res.json(subCategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route POST /api/categories/:categoryId/subcategories
 * @desc Create a new sub-category for a specific category
 * @access Private (Admin only)
 */
router.post('/:categoryId/subcategories', protect, isAdmin, subCategoryValidationRules, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.categoryId;
    const { name } = req.body;
    const businessId = req.user.business_id;

    try {
        // Verify the category exists and belongs to the business
        const [[category]] = await db.query('SELECT id FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        if (!category) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        // Check if sub-category name already exists under this category
        const [[existingSubCategory]] = await db.query('SELECT id FROM sub_categories WHERE category_id = ? AND business_id = ? AND name = ?', [categoryId, businessId, name]);
        if (existingSubCategory) {
            return res.status(409).json({ message: 'Nama sub-kategori sudah ada dalam kategori ini.' });
        }

        const [result] = await db.query(
            'INSERT INTO sub_categories (category_id, business_id, name) VALUES (?, ?, ?)',
            [categoryId, businessId, name]
        );
        const subCategoryId = result.insertId;
        await logActivity(businessId, req.user.id, 'CREATE_SUB_CATEGORY', `Created sub-category: ${name} (Category ID: ${categoryId}, Sub-category ID: ${subCategoryId}).`);
        res.status(201).json({ message: 'Sub-kategori berhasil ditambahkan!', subCategoryId });
    } catch (error) {
        console.error('Error creating sub-category:', error);
        await logActivity(businessId, req.user.id, 'CREATE_SUB_CATEGORY_FAILED', `Failed to create sub-category ${name} for category ID ${categoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route PUT /api/categories/subcategories/:id
 * @desc Update an existing sub-category
 * @access Private (Admin only)
 */
router.put('/subcategories/:id', protect, isAdmin, subCategoryValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const subCategoryId = req.params.id;
    const { name } = req.body;
    const businessId = req.user.business_id;

    try {
        // Check if sub-category exists and belongs to the business
        const [[existingSubCategory]] = await db.query('SELECT name, category_id FROM sub_categories WHERE id = ? AND business_id = ?', [subCategoryId, businessId]);
        if (!existingSubCategory) {
            return res.status(404).json({ message: 'Sub-kategori tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        // Check if the new name already exists for another sub-category under the same parent category
        const [[duplicateName]] = await db.query('SELECT id FROM sub_categories WHERE category_id = ? AND business_id = ? AND name = ? AND id != ?', [existingSubCategory.category_id, businessId, name, subCategoryId]);
        if (duplicateName) {
            return res.status(409).json({ message: 'Nama sub-kategori sudah digunakan oleh sub-kategori lain dalam kategori ini.' });
        }

        const [result] = await db.query(
            'UPDATE sub_categories SET name = ? WHERE id = ? AND business_id = ?',
            [name, subCategoryId, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub-kategori tidak ditemukan atau tidak ada perubahan.' });
        }

        await logActivity(businessId, req.user.id, 'UPDATE_SUB_CATEGORY', `Updated sub-category from "${existingSubCategory.name}" to "${name}" (ID: ${subCategoryId}).`);
        res.json({ message: 'Sub-kategori berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating sub-category:', error);
        await logActivity(businessId, req.user.id, 'UPDATE_SUB_CATEGORY_FAILED', `Failed to update sub-category ID ${subCategoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


/**
 * @route DELETE /api/categories/subcategories/:id
 * @desc Delete a sub-category, unlinking products
 * @access Private (Admin only)
 */
router.delete('/subcategories/:id', protect, isAdmin, async (req, res) => {
    const subCategoryId = req.params.id;
    const businessId = req.user.business_id;
    const connection = await db.getConnection(); // Get a connection for transaction
    try {
        await connection.beginTransaction();

        // Get sub-category name for logging before deletion
        const [[subCategoryName]] = await connection.query('SELECT name FROM sub_categories WHERE id = ? AND business_id = ?', [subCategoryId, businessId]);
        if (!subCategoryName) {
            await logActivity(businessId, req.user.id, 'DELETE_SUB_CATEGORY_FAILED', `Attempted to delete non-existent or unauthorized sub-category ID ${subCategoryId}.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Sub-kategori tidak ditemukan atau Anda tidak punya akses.' });
        }

        // Unlink products from this sub-category
        await connection.query('UPDATE products SET sub_category_id = NULL WHERE sub_category_id = ? AND business_id = ?', [subCategoryId, businessId]);

        // Delete the sub-category itself
        const [result] = await connection.query('DELETE FROM sub_categories WHERE id = ? AND business_id = ?', [subCategoryId, businessId]);

        if (result.affectedRows === 0) {
            // This case might be hit if the sub-category somehow disappeared between the initial SELECT and DELETE
            throw new Error('Failed to delete sub-category, possibly concurrency issue or not found during final delete.');
        }

        await connection.commit(); // Commit the transaction
        await logActivity(businessId, req.user.id, 'DELETE_SUB_CATEGORY', `Deleted sub-category: ${subCategoryName.name} (ID: ${subCategoryId}).`);
        res.json({ message: 'Sub-kategori berhasil dihapus.' });
    } catch (error) {
        await connection.rollback(); // Rollback on error
        console.error('Error deleting sub-category:', error);
        await logActivity(businessId, req.user.id, 'DELETE_SUB_CATEGORY_FAILED', `Failed to delete sub-category ID ${subCategoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release(); // Always release the connection
    }
});

module.exports = router;