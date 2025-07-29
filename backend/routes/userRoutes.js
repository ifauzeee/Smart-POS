// backend/routes/userRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const nodemailer = require('nodemailer');
const { decrypt } = require('../utils/encryption');
const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Hanya untuk Admin." });
    }
    next();
};

// Register endpoint
router.post('/register', async (req, res) => {
    const { name, email, password, registrationKey } = req.body;

    if (!name || !email || !password || !registrationKey) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    try {
        const [[existingUser]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }

        const [[anyAdmin]] = await db.query('SELECT id FROM users WHERE role = "admin"');
        let role = 'kasir';
        if (!anyAdmin) {
            // First user to register becomes admin if registration key matches
            if (registrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
                return res.status(403).json({ message: 'Kode registrasi admin tidak valid.' });
            }
            role = 'admin';
        } else {
            // If there's already an admin, public registration is not allowed
            // This is a design choice; you might allow public cashier registration
            return res.status(403).json({ message: 'Registrasi akun admin hanya dapat dilakukan satu kali. Hubungi admin untuk membuat akun baru.' });
            // If you want to allow regular users (cashiers) to register without key, remove the above line
            // and ensure your frontend distinguishes between admin and cashier registration forms.
            // For simplicity, this template assumes only one initial admin registration via key.
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // For the first admin, create a new business
        let businessId = null;
        if (role === 'admin') {
            const [businessResult] = await db.query('INSERT INTO businesses (business_name) VALUES (?)', [`${name}'s Business`]);
            businessId = businessResult.insertId;
            // Also create default settings for this new business
            await db.query('INSERT INTO email_settings (business_id) VALUES (?)', [businessId]);
        }

        const [userResult] = await db.query('INSERT INTO users (business_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [businessId, name, email, hashedPassword, role]);
        const newUser = {
            id: userResult.insertId,
            name,
            email,
            role,
            business_id: businessId
        };
        
        await logActivity(businessId, newUser.id, 'USER_REGISTER', `New user registered: ${name} (${role}).`);
        
        const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, business_id: newUser.business_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ message: 'Registrasi berhasil!', token });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password harus diisi.' });
    }

    try {
        const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, business_id: user.business_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        await logActivity(user.business_id, user.id, 'USER_LOGIN', `User ${user.name} logged in.`);
        res.json({ message: 'Login berhasil!', token });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// --- ENDPOINT BARU: LUPA PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Alamat email harus diisi.' });
    }

    try {
        const [[user]] = await db.query('SELECT id, business_id, name FROM users WHERE email = ?', [email]);
        if (!user) {
            // Tetap kirim respons sukses untuk mencegah enumerasi email
            return res.status(200).json({ message: 'Jika email terdaftar, link reset akan dikirim.' });
        }

        const businessId = user.business_id;
        const [[emailSettings]] = await db.query(
            'SELECT sender_email, app_password, sender_name FROM email_settings WHERE business_id = ?',
            [businessId]
        );

        if (!emailSettings || !emailSettings.sender_email || !emailSettings.app_password) {
            return res.status(500).json({ message: 'Layanan email belum dikonfigurasi oleh admin.' });
        }

        // Buat token reset dengan masa berlaku singkat (15 menit)
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: emailSettings.sender_email,
                pass: decrypt(emailSettings.app_password),
            },
        });

        await transporter.sendMail({
            from: `"${emailSettings.sender_name || 'Smart POS'}" <${emailSettings.sender_email}>`,
            to: email,
            subject: 'Reset Password Akun Smart POS Anda',
            html: `
                <p>Halo ${user.name},</p>
                <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p>
                <p>Silakan klik link di bawah ini untuk melanjutkan:</p>
                <a href="${resetLink}" target="_blank">Reset Password Saya</a>
                <p>Link ini hanya berlaku selama 15 menit. Jika Anda tidak merasa meminta ini, abaikan saja email ini.</p>
            `,
        });

        await logActivity(businessId, user.id, 'FORGOT_PASSWORD_REQUEST', `Password reset link sent to ${email}.`);
        res.status(200).json({ message: 'Jika email terdaftar, link reset akan dikirim.' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

// --- ENDPOINT BARU: RESET PASSWORD ---
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password baru harus diisi.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        
        // Log aktivitas tanpa businessId jika tidak ada di token (opsional, tapi bagus)
        const [[user]] = await db.query('SELECT business_id, name FROM users WHERE id = ?', [userId]);
        if(user) {
            await logActivity(user.business_id, userId, 'PASSWORD_RESET_SUCCESS', `Password for user ${user.name} has been reset.`);
        }
        
        res.status(200).json({ message: 'Password berhasil direset! Silakan login dengan password baru Anda.' });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ message: 'Link reset password sudah kedaluwarsa. Silakan minta yang baru.' });
        }
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Token tidak valid atau terjadi kesalahan.' });
    }
});


// User Profile (logged-in user)
router.get('/profile', protect, (req, res) => {
    // req.user comes from protect middleware
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, business_id: req.user.business_id });
});

// GET all users (Admin only)
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE business_id = ? ORDER BY created_at DESC', [businessId]);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// CREATE user (Admin only)
router.post('/', protect, isAdmin, async (req, res) => {
    const { name, email, password, role } = req.body;
    const businessId = req.user.business_id; // Admin's business_id

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Semua kolom harus diisi.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    try {
        const [[existingUser]] = await db.query('SELECT id FROM users WHERE email = ? AND business_id = ?', [email, businessId]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email ini sudah digunakan di bisnis Anda.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await db.query('INSERT INTO users (business_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [businessId, name, email, hashedPassword, role]);
        const userId = result.insertId;
        await logActivity(businessId, req.user.id, 'CREATE_USER_BY_ADMIN', `Admin created new user: ${name} (${role}).`);
        res.status(201).json({ message: 'Pengguna berhasil ditambahkan!', userId });
    } catch (error) {
        console.error('Error creating user by admin:', error);
        await logActivity(businessId, req.user.id, 'CREATE_USER_BY_ADMIN_FAILED', `Failed to create user ${name}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// UPDATE user (Admin only)
router.put('/:id', protect, isAdmin, async (req, res) => {
    const userIdToUpdate = req.params.id;
    const { name, email, password, role } = req.body;
    const businessId = req.user.business_id;

    if (!name || !email || !role) {
        return res.status(400).json({ message: 'Nama, email, dan peran harus diisi.' });
    }

    try {
        let hashedPassword = null;
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password minimal 6 karakter.' });
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const [[targetUser]] = await db.query('SELECT email FROM users WHERE id = ? AND business_id = ?', [userIdToUpdate, businessId]);
        if (!targetUser) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau Anda tidak punya akses.' });
        }

        // Check if new email already exists for another user in the same business
        if (email !== targetUser.email) {
            const [[emailExists]] = await db.query('SELECT id FROM users WHERE email = ? AND business_id = ? AND id != ?', [email, businessId, userIdToUpdate]);
            if (emailExists) {
                return res.status(400).json({ message: 'Email ini sudah digunakan oleh pengguna lain di bisnis Anda.' });
            }
        }

        const updateFields = [`name = ?`, `email = ?`, `role = ?`];
        const updateValues = [name, email, role];

        if (hashedPassword) {
            updateFields.push(`password = ?`);
            updateValues.push(hashedPassword);
        }
        updateValues.push(userIdToUpdate, businessId);

        const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND business_id = ?`;
        const [result] = await db.query(updateSql, updateValues);

        if (result.affectedRows === 0) {
            await logActivity(businessId, req.user.id, 'UPDATE_USER_FAILED', `Attempted to update non-existent user ID ${userIdToUpdate} or no changes made.`);
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau tidak ada perubahan yang dibuat.' });
        }
        await logActivity(businessId, req.user.id, 'UPDATE_USER', `Admin updated user ID ${userIdToUpdate}.`);
        res.json({ message: 'Pengguna berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating user:', error);
        await logActivity(businessId, req.user.id, 'UPDATE_USER_ERROR', `Error updating user ID ${userIdToUpdate}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE user (Admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
    const userIdToDelete = req.params.id;
    const businessId = req.user.business_id;

    if (parseInt(userIdToDelete) === req.user.id) {
        return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
    }

    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ? AND business_id = ?', [userIdToDelete, businessId]);
        if (result.affectedRows === 0) {
            await logActivity(businessId, req.user.id, 'DELETE_USER_FAILED', `Attempted to delete non-existent or unauthorized user ID ${userIdToDelete}.`);
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau Anda tidak punya akses.' });
        }
        await logActivity(businessId, req.user.id, 'DELETE_USER', `Admin deleted user ID ${userIdToDelete}.`);
        res.json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        await logActivity(businessId, req.user.id, 'DELETE_USER_ERROR', `Error deleting user ID ${userIdToDelete}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;