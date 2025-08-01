const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { encrypt } = require('../utils/encryption');
const { logActivity } = require('../utils/logUtils');
const router = express.Router();

// GET /api/settings/business
router.get('/business', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [[settings]] = await db.query(
            'SELECT business_name, address, phone_number, website, logo_url, payment_methods, receipt_logo_url, receipt_footer_text, tax_rate, default_starting_cash FROM businesses WHERE id = ?',
            [businessId]
        );

        if (!settings) {
            return res.status(404).json({ message: 'Pengaturan bisnis tidak ditemukan.' });
        }
        
        res.json(settings);

    } catch (error) {
        console.error("Error fetching business settings:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// POST /api/settings/business
router.post('/business', protect, isAdmin, async (req, res) => {
    const {
        business_name,
        address,
        phone,
        website,
        logo_url,
        payment_methods,
        receipt_logo_url,
        receipt_footer_text,
        tax_rate,
        default_starting_cash // <-- Variabel baru
    } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        await db.query(
            `UPDATE businesses SET 
                business_name = ?, address = ?, phone_number = ?, website = ?, 
                logo_url = ?, payment_methods = ?, receipt_logo_url = ?, 
                receipt_footer_text = ?, tax_rate = ?, default_starting_cash = ? 
            WHERE id = ?`,
            [
                business_name || null,
                address || null,
                phone || null,
                website || null,
                logo_url || null,
                JSON.stringify(payment_methods),
                receipt_logo_url || null,
                receipt_footer_text || null,
                parseFloat(tax_rate) || 0,
                parseFloat(default_starting_cash) || 0, // <-- Simpan nilai baru
                businessId
            ]
        );

        await logActivity(businessId, userId, 'UPDATE_BUSINESS_SETTINGS', 'Setelan bisnis diperbarui.');
        res.status(200).json({ message: 'Setelan bisnis berhasil diperbarui.' });
    } catch (error) {
        console.error("Error saving business settings:", error);
        await logActivity(businessId, userId, 'UPDATE_BUSINESS_SETTINGS_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// GET /api/settings/email
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
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// POST /api/settings/email
router.post('/email', protect, isAdmin, async (req, res) => {
    const { email, appPassword, sender_name } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

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
        await logActivity(businessId, userId, 'UPDATE_EMAIL_SETTINGS', `Setelan email diperbarui.`);
        res.status(200).json({ message: 'Setelan email berhasil disimpan.' });
    } catch (error) {
        console.error("Error saving email settings:", error);
        await logActivity(businessId, userId, 'SAVE_EMAIL_SETTINGS_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET /api/settings/revenue-target
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
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// POST /api/settings/revenue-target
router.post('/revenue-target', protect, isAdmin, async (req, res) => {
    const { target } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;

    try {
        await db.query(
            'UPDATE businesses SET monthly_revenue_target = ? WHERE id = ?',
            [parseFloat(target), businessId]
        );

        await logActivity(businessId, userId, 'UPDATE_REVENUE_TARGET', `Target pendapatan diperbarui ke ${target}.`);
        res.status(200).json({ message: 'Target pendapatan berhasil diperbarui.' });
    } catch (error) {
        console.error("Error saving revenue target:", error);
        await logActivity(businessId, userId, 'UPDATE_REVENUE_TARGET_FAILED', `Error: ${error.message}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;