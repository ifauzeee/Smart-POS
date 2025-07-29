// backend/routes/settingsRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { encrypt, decrypt } = require('../utils/encryption');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Memerlukan peran admin." });
    }
    next();
};

// --- RUTE UNTUK SETELAN EMAIL ---
router.get('/email', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [[settings]] = await db.query(
            'SELECT sender_email, sender_name FROM email_settings WHERE business_id = ?',
            [businessId]
        );
        res.json({
            sender_email: settings ? settings.sender_email : null,
            sender_name: settings ? settings.sender_name : null
        });
    } catch (error) {
        console.error("Error fetching email settings:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/email', protect, isAdmin, async (req, res) => {
    const { email, appPassword, sender_name } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!email || !appPassword) {
        return res.status(400).json({ message: 'Email pengirim dan Sandi Aplikasi harus diisi.' });
    }

    try {
        const encryptedPassword = encrypt(appPassword);
        const [[existing]] = await db.query('SELECT id FROM email_settings WHERE business_id = ?', [businessId]);

        if (existing) {
            await db.query(
                'UPDATE email_settings SET sender_email = ?, app_password = ?, sender_name = ? WHERE business_id = ?',
                [email, encryptedPassword, sender_name || null, businessId]
            );
        } else {
            await db.query(
                'INSERT INTO email_settings (business_id, sender_email, app_password, sender_name) VALUES (?, ?, ?, ?)',
                [businessId, email, encryptedPassword, sender_name || null]
            );
        }
        await logActivity(businessId, userId, 'UPDATE_EMAIL_SETTINGS', `Email settings updated.`);
        res.status(200).json({ message: 'Setelan email berhasil disimpan.' });
    } catch (error) {
        console.error("Error saving email settings:", error);
        await logActivity(businessId, userId, 'SAVE_EMAIL_SETTINGS_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- RUTE UNTUK SETELAN BISNIS ---
router.get('/business', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        // Removed low_stock_threshold from query
        const [[settings]] = await db.query(
            'SELECT payment_methods, receipt_logo_url, receipt_footer_text, tax_rate FROM businesses WHERE id = ?',
            [businessId]
        );

        if (!settings) {
            return res.status(404).json({ message: 'Pengaturan bisnis tidak ditemukan.' });
        }
        res.json(settings);
    } catch (error) {
        console.error("Error fetching business settings:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/business', protect, isAdmin, async (req, res) => {
    // Removed low_stock_threshold from request body
    const { payment_methods, receipt_logo_url, receipt_footer_message, tax_rate } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (!Array.isArray(payment_methods) || payment_methods.length === 0) {
        return res.status(400).json({ message: 'Metode pembayaran harus berupa array dan tidak boleh kosong.' });
    }
    // Frontend sekarang akan mengirimkan nilai desimal, validasi ini untuk desimal
    if (tax_rate === undefined || isNaN(parseFloat(tax_rate)) || parseFloat(tax_rate) < 0) {
        return res.status(400).json({ message: 'Tarif pajak tidak valid.' });
    }
    // Removed validation for low_stock_threshold


    try {
        // Removed low_stock_threshold from query UPDATE
        await db.query(
            'UPDATE businesses SET payment_methods = ?, receipt_logo_url = ?, receipt_footer_text = ?, tax_rate = ? WHERE id = ?',
            [JSON.stringify(payment_methods), receipt_logo_url, receipt_footer_message, parseFloat(tax_rate), businessId]
        );

        await logActivity(businessId, userId, 'UPDATE_BUSINESS_SETTINGS', 'Business settings updated.');
        res.status(200).json({ message: 'Setelan bisnis berhasil diperbarui.' });
    } catch (error) {
        console.error("Error saving business settings:", error);
        await logActivity(businessId, userId, 'UPDATE_BUSINESS_SETTINGS_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
});

// --- RUTE UNTUK TARGET PENDAPATAN ---
router.get('/revenue-target', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [[settings]] = await db.query(
            'SELECT monthly_revenue_target FROM businesses WHERE id = ?',
            [businessId]
        );
        res.json({ monthly_revenue_target: settings?.monthly_revenue_target || 0 });
    } catch (error) {
        console.error("Error fetching revenue target:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/revenue-target', protect, isAdmin, async (req, res) => {
    const { target } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    if (target === undefined || isNaN(parseFloat(target)) || parseFloat(target) < 0) {
        return res.status(400).json({ message: 'Target pendapatan tidak valid.' });
    }

    try {
        await db.query(
            'UPDATE businesses SET monthly_revenue_target = ? WHERE id = ?',
            [parseFloat(target), businessId]
        );

        await logActivity(businessId, userId, 'UPDATE_REVENUE_TARGET', `Revenue target updated to ${target}.`);
        res.status(200).json({ message: 'Target pendapatan berhasil diperbarui.' });
    } catch (error) {
        console.error("Error saving revenue target:", error);
        await logActivity(businessId, userId, 'UPDATE_REVENUE_TARGET_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: "Server Error" });
    }
});


module.exports = router;