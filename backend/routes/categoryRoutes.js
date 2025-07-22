const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// --- API UNTUK KATEGORI UTAMA ---

// GET semua kategori
router.get('/', protect, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST buat kategori baru
router.post('/', protect, async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Kategori berhasil dibuat.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE kategori
router.delete('/:id', protect, async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Kategori berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- API UNTUK SUB-KATEGORI ---

// GET semua sub-kategori berdasarkan ID kategori utama
router.get('/:categoryId/subcategories', protect, async (req, res) => {
    try {
        const [subCategories] = await db.query(
            'SELECT id, name, image_url FROM sub_categories WHERE category_id = ? ORDER BY name ASC',
            [req.params.categoryId]
        );
        res.json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST buat sub-kategori baru
router.post('/:categoryId/subcategories', protect, async (req, res) => {
    const { name, image_url } = req.body;
    try {
        await db.query(
            'INSERT INTO sub_categories (name, category_id, image_url) VALUES (?, ?, ?)',
            [name, req.params.categoryId, image_url || null]
        );
        res.status(201).json({ message: 'Sub-kategori berhasil dibuat.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE sub-kategori
router.delete('/subcategories/:id', protect, async (req, res) => {
    try {
        await db.query('DELETE FROM sub_categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Sub-kategori berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;