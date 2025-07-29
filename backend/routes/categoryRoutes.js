// backend/routes/categoryRoutes.js
const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    next();
};

// CREATE Category
router.post('/', protect, isAdmin, async (req, res) => {
    const { name } = req.body;
    const businessId = req.user.business_id;

    if (!name) {
        return res.status(400).json({ message: 'Nama kategori harus diisi.' });
    }

    try {
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

// READ All Categories
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

// DELETE Category
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const categoryId = req.params.id;
    const businessId = req.user.business_id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [[categoryName]] = await connection.query('SELECT name FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        if (!categoryName) {
            await logActivity(businessId, req.user.id, 'DELETE_CATEGORY_FAILED', `Attempted to delete non-existent or unauthorized category ID ${categoryId}.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak punya akses.' });
        }
        
        await connection.query('UPDATE products SET category_id = NULL WHERE category_id = ? AND business_id = ?', [categoryId, businessId]);
        await connection.query('UPDATE products SET sub_category_id = NULL WHERE sub_category_id IN (SELECT id FROM sub_categories WHERE category_id = ?) AND business_id = ?', [categoryId, businessId]);
        
        await connection.query('DELETE FROM sub_categories WHERE category_id = ? AND business_id = ?', [categoryId, businessId]);
        
        const [result] = await connection.query('DELETE FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        
        if (result.affectedRows === 0) {
            throw new Error('Failed to delete category, possibly concurrency issue.');
        }

        await connection.commit();
        await logActivity(businessId, req.user.id, 'DELETE_CATEGORY', `Deleted category: ${categoryName.name} (ID: ${categoryId}).`);
        res.json({ message: 'Kategori dan sub-kategorinya berhasil dihapus.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting category:', error);
        await logActivity(businessId, req.user.id, 'DELETE_CATEGORY_FAILED', `Failed to delete category ID ${categoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
});


// READ Sub-categories by Category ID
router.get('/:categoryId/subcategories', protect, async (req, res) => {
    const categoryId = req.params.categoryId;
    const businessId = req.user.business_id;
    try {
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

// CREATE Sub-category
router.post('/:categoryId/subcategories', protect, isAdmin, async (req, res) => {
    const categoryId = req.params.categoryId;
    const { name } = req.body;
    const businessId = req.user.business_id;

    if (!name) {
        return res.status(400).json({ message: 'Nama sub-kategori harus diisi.' });
    }

    try {
        const [[category]] = await db.query('SELECT id FROM categories WHERE id = ? AND business_id = ?', [categoryId, businessId]);
        if (!category) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak memiliki akses.' });
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

// DELETE Sub-category
router.delete('/subcategories/:id', protect, isAdmin, async (req, res) => {
    const subCategoryId = req.params.id;
    const businessId = req.user.business_id;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [[subCategoryName]] = await connection.query('SELECT name FROM sub_categories WHERE id = ? AND business_id = ?', [subCategoryId, businessId]);
        if (!subCategoryName) {
            await logActivity(businessId, req.user.id, 'DELETE_SUB_CATEGORY_FAILED', `Attempted to delete non-existent or unauthorized sub-category ID ${subCategoryId}.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Sub-kategori tidak ditemukan atau Anda tidak punya akses.' });
        }

        await connection.query('UPDATE products SET sub_category_id = NULL WHERE sub_category_id = ? AND business_id = ?', [subCategoryId, businessId]);
        
        const [result] = await connection.query('DELETE FROM sub_categories WHERE id = ? AND business_id = ?', [subCategoryId, businessId]);

        if (result.affectedRows === 0) {
            throw new Error('Failed to delete sub-category, possibly concurrency issue.');
        }

        await connection.commit();
        await logActivity(businessId, req.user.id, 'DELETE_SUB_CATEGORY', `Deleted sub-category: ${subCategoryName.name} (ID: ${subCategoryId}).`);
        res.json({ message: 'Sub-kategori berhasil dihapus.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting sub-category:', error);
        await logActivity(businessId, req.user.id, 'DELETE_SUB_CATEGORY_FAILED', `Failed to delete sub-category ID ${subCategoryId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
});


module.exports = router;