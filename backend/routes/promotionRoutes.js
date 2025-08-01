const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// --- Validation Rules ---

const promotionValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama promosi tidak boleh kosong.')
        .isLength({ max: 100 }).withMessage('Nama promosi maksimal 100 karakter.'),
    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Deskripsi promosi maksimal 500 karakter.'),
    body('type')
        .notEmpty().withMessage('Tipe promosi tidak boleh kosong.')
        .isIn(['percentage', 'fixed_amount']).withMessage('Tipe promosi tidak valid (harus "percentage" atau "fixed_amount").'),
    body('value')
        .isFloat({ gt: 0 }).withMessage('Nilai promosi harus angka positif.'),
    body('code')
        .optional({ checkFalsy: true })
        .trim()
        .isAlphanumeric().withMessage('Kode promo hanya boleh berisi huruf dan angka.')
        .isLength({ min: 3, max: 20 }).withMessage('Kode promo harus antara 3 dan 20 karakter.'),
    body('start_date')
        .optional({ checkFalsy: true })
        .isISO8601().toDate().withMessage('Tanggal mulai tidak valid.'),
    body('end_date')
        .optional({ checkFalsy: true })
        .isISO8601().toDate().withMessage('Tanggal berakhir tidak valid.')
        .custom((value, { req }) => {
            if (req.body.start_date && value && new Date(value) < new Date(req.body.start_date)) {
                throw new Error('Tanggal berakhir tidak boleh sebelum tanggal mulai.');
            }
            return true;
        }),
    body('is_active')
        .isBoolean().withMessage('Status aktif harus berupa boolean (true/false).')
        .toBoolean()
];

// --- Promotion Endpoints ---

/**
 * @route GET /api/promotions
 * @desc Get all promotions for the business
 * @access Private (Admin only)
 */
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        // Log untuk memeriksa req.user.business_id
        if (!req.user || !req.user.business_id) {
            console.error('Error: req.user or req.user.business_id is missing.');
            return res.status(401).json({ message: "Tidak terautentikasi atau business_id tidak ditemukan." });
        }
        console.log('Fetching promotions for business_id:', req.user.business_id);

        const [promotions] = await db.query(
            'SELECT id, name, description, type, value, code, start_date, end_date, is_active, created_at, updated_at FROM promotions WHERE business_id = ? ORDER BY created_at DESC',
            [req.user.business_id]
        );
        res.json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        // Sertakan detail error di respons untuk debugging lebih lanjut (hanya di lingkungan dev)
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route POST /api/promotions
 * @desc Create a new promotion
 * @access Private (Admin only)
 */
router.post('/', protect, isAdmin, promotionValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, value, code, start_date, end_date, is_active } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Check for duplicate code within the same business if code is provided
        if (code) {
            const [[existingCode]] = await db.query('SELECT id FROM promotions WHERE business_id = ? AND code = ?', [businessId, code]);
            if (existingCode) {
                return res.status(409).json({ message: 'Kode promo sudah digunakan oleh promosi lain.' });
            }
        }

        const [result] = await db.query(
            'INSERT INTO promotions (business_id, name, description, type, value, code, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [businessId, name, description || null, type, value, code || null, start_date || null, end_date || null, is_active]
        );
        await logActivity(businessId, userId, 'CREATE_PROMOTION', `Membuat promosi: ${name} (ID: ${result.insertId}, Kode: ${code || 'N/A'}).`);
        res.status(201).json({ message: 'Promosi berhasil dibuat.', id: result.insertId });
    } catch (error) {
        console.error('Error creating promotion:', error);
        await logActivity(businessId, userId, 'CREATE_PROMOTION_FAILED', `Gagal membuat promosi ${name}. Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route PUT /api/promotions/:id
 * @desc Update an existing promotion
 * @access Private (Admin only)
 */
router.put('/:id', protect, isAdmin, promotionValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const promotionId = req.params.id;
    const { name, description, type, value, code, start_date, end_date, is_active } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Verify promotion exists and belongs to the current business
        const [[originalPromotion]] = await db.query('SELECT name, code FROM promotions WHERE id = ? AND business_id = ?', [promotionId, businessId]);
        if (!originalPromotion) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        // Check for duplicate code if code is changing and provided
        if (code && originalPromotion.code !== code) {
            const [[existingCode]] = await db.query('SELECT id FROM promotions WHERE business_id = ? AND code = ? AND id != ?', [businessId, code, promotionId]);
            if (existingCode) {
                return res.status(409).json({ message: 'Kode promo sudah digunakan oleh promosi lain.' });
            }
        }

        const [result] = await db.query(
            'UPDATE promotions SET name = ?, description = ?, type = ?, value = ?, code = ?, start_date = ?, end_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?',
            [name, description || null, type, value, code || null, start_date || null, end_date || null, is_active, promotionId, businessId]
        );

        if (result.affectedRows === 0) {
            return res.status(200).json({ message: 'Promosi ditemukan tetapi tidak ada perubahan yang dibuat.' });
        }

        await logActivity(businessId, userId, 'UPDATE_PROMOTION', `Memperbarui promosi: ${name} (ID: ${promotionId}, Kode: ${code || 'N/A'}).`);
        res.status(200).json({ message: 'Promosi berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating promotion:', error);
        await logActivity(businessId, userId, 'UPDATE_PROMOTION_FAILED', `Gagal memperbarui promosi ID ${promotionId}. Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


/**
 * @route GET /api/promotions/validate/:code
 * @desc Validate a promotion code for cashier use
 * @access Private (Authenticated users)
 */
router.get('/validate/:code', protect, async (req, res) => {
    const { code } = req.params;
    const businessId = req.user.business_id;

    if (!code || code.trim().length === 0) {
        return res.status(400).json({ message: 'Kode promo tidak boleh kosong.' });
    }

    try {
        const query = `
            SELECT id, name, description, type, value, code, start_date, end_date, is_active
            FROM promotions
            WHERE code = ? AND business_id = ? AND is_active = TRUE
            AND (start_date IS NULL OR NOW() >= start_date)
            AND (end_date IS NULL OR NOW() <= end_date)
        `;
        const [[promotion]] = await db.query(query, [code, businessId]);

        if (!promotion) {
            await logActivity(businessId, req.user.id, 'VALIDATE_PROMOTION_FAILED', `Gagal memvalidasi kode promo: ${code}. Tidak valid atau kedaluwarsa.`);
            return res.status(404).json({ message: 'Kode promo tidak valid atau sudah kedaluwarsa.' });
        }

        await logActivity(businessId, req.user.id, 'VALIDATE_PROMOTION_SUCCESS', `Kode promo ${code} berhasil divalidasi.`);
        res.json(promotion);
    } catch (error) {
        console.error('Error validating promotion code:', error);
        await logActivity(businessId, req.user.id, 'VALIDATE_PROMOTION_ERROR', `Error saat memvalidasi kode promo ${code}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route DELETE /api/promotions/:id
 * @desc Delete a promotion
 * @access Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const promotionId = req.params.id;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        // Get promotion name for logging before deletion
        const [[promotionName]] = await db.query('SELECT name FROM promotions WHERE id = ? AND business_id = ?', [promotionId, businessId]);
        if (!promotionName) {
            return res.status(404).json({ message: 'Promosi tidak ditemukan atau Anda tidak punya akses.' });
        }

        const [result] = await db.query(
            'DELETE FROM promotions WHERE id = ? AND business_id = ?',
            [promotionId, businessId]
        );
        if (result.affectedRows === 0) {
            // This might happen if the promotion was already deleted by another process
            throw new Error('Gagal menghapus promosi, kemungkinan masalah konkurensi.');
        }

        await logActivity(businessId, userId, 'DELETE_PROMOTION', `Menghapus promosi: ${promotionName.name} (ID: ${promotionId}).`);
        res.json({ message: 'Promosi berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        await logActivity(businessId, userId, 'DELETE_PROMOTION_FAILED', `Gagal menghapus promosi ID ${promotionId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
