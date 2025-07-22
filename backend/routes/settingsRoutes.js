const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { encrypt } = require('../utils/encryption'); // PERBAIKAN DI SINI

const router = express.Router();

// Menyimpan/Update setelan email untuk admin yang sedang login
router.post('/email', protect, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak.' });

    const { email, appPassword } = req.body;
    if (!email || !appPassword) return res.status(400).json({ message: 'Email dan Sandi Aplikasi harus diisi.' });
    
    try {
        const encryptedPassword = encrypt(appPassword);
        await db.query(
            'UPDATE users SET smtp_email_user = ?, smtp_email_pass = ? WHERE id = ?',
            [email, encryptedPassword, req.user.id]
        );
        res.json({ message: 'Setelan email berhasil disimpan.' });
    } catch (error) {
        console.error("Error saving email settings:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Mendapatkan setelan email (hanya email, tanpa password)
router.get('/email', protect, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Akses ditolak.' });
    try {
        const [[user]] = await db.query('SELECT smtp_email_user FROM users WHERE id = ?', [req.user.id]);
        res.json({ email: user.smtp_email_user || '' });
    } catch (error) {
        console.error("Error fetching email settings:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;