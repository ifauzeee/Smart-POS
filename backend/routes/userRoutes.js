// C:\Users\Ibnu\Project\smart-pos\backend\routes\userRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const nodemailer = require('nodemailer');
const { decrypt } = require('../utils/encryption');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// --- Validation Rules ---

const registerValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama tidak boleh kosong.'),
    body('email').trim().notEmpty().withMessage('Email tidak boleh kosong.').isEmail().withMessage('Format email tidak valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
    body('registrationKey').notEmpty().withMessage('Kunci registrasi tidak boleh kosong.')
];

const loginValidationRules = [
    body('email').trim().notEmpty().withMessage('Email tidak boleh kosong.').isEmail().withMessage('Format email tidak valid.'),
    body('password').notEmpty().withMessage('Password tidak boleh kosong.')
];

const createUserValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama tidak boleh kosong.'),
    body('email').trim().notEmpty().withMessage('Email tidak boleh kosong.').isEmail().withMessage('Format email tidak valid.'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
    body('role_id').isInt({ min: 1 }).withMessage('ID peran tidak valid.')
];

const updateUserValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama tidak boleh kosong.'),
    body('email').trim().notEmpty().withMessage('Email tidak boleh kosong.').isEmail().withMessage('Format email tidak valid.'),
    body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password minimal 6 karakter jika diisi.'),
    body('role_id').isInt({ min: 1 }).withMessage('ID peran tidak valid.')
];

const userIdValidation = [
    param('id').isInt({ min: 1 }).withMessage('ID pengguna tidak valid.')
];

const forgotPasswordValidationRules = [
    body('email').trim().notEmpty().withMessage('Email tidak boleh kosong.').isEmail().withMessage('Format email tidak valid.')
];

const resetPasswordValidationRules = [
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Konfirmasi password tidak cocok dengan password.');
        }
        return true;
    })
];

// --- User Authentication & Profile Endpoints ---

router.post('/register', registerValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, registrationKey } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [[existingUser]] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            await connection.rollback();
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }

        const [[anyAdminBusiness]] = await connection.query('SELECT id FROM businesses WHERE admin_created = 1 LIMIT 1');
        
        let role_id;
        let businessId;

        if (!anyAdminBusiness) {
            if (registrationKey !== process.env.ADMIN_REGISTRATION_KEY) {
                await connection.rollback();
                return res.status(403).json({ message: 'Kode registrasi admin tidak valid.' });
            }

            const [businessResult] = await connection.query('INSERT INTO businesses (business_name, admin_created) VALUES (?, ?)', [`${name}'s Business`, 1]);
            businessId = businessResult.insertId;

            const [adminRoleResult] = await connection.query(`INSERT INTO roles (business_id, name, description) VALUES (?, 'admin', 'Akses penuh ke semua fitur.')`, [businessId]);
            role_id = adminRoleResult.insertId;
            await connection.query(`INSERT INTO roles (business_id, name, description) VALUES (?, 'kasir', 'Akses terbatas untuk operasional kasir.')`, [businessId]);
            await connection.query('INSERT INTO email_settings (business_id) VALUES (?)', [businessId]);
            
            // Tambahkan semua permissions ke peran 'admin' yang baru dibuat
            const [allPermissions] = await connection.query('SELECT id FROM permissions');
            if (allPermissions.length > 0) {
                const rolePermissionsData = allPermissions.map(p => [role_id, p.id]);
                await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [rolePermissionsData]);
            }
        } else {
            await connection.rollback();
            return res.status(403).json({ message: 'Registrasi akun admin hanya dapat dilakukan satu kali. Hubungi admin yang sudah ada untuk membuat akun baru.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await connection.query(
            'INSERT INTO users (business_id, name, email, password, role_id) VALUES (?, ?, ?, ?, ?)',
            [businessId, name, email, hashedPassword, role_id]
        );
        const newUserId = userResult.insertId;

        await connection.commit();
        
        // Ambil permissions yang baru dibuat untuk admin
        const [permissionsResult] = await connection.query(
            `SELECT p.name FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = ?`,
            [role_id]
        );
        const newAdminPermissions = permissionsResult.map(p => p.name);

        const token = jwt.sign({ id: newUserId, name, email, role: 'admin', business_id: businessId, permissions: newAdminPermissions }, process.env.JWT_SECRET, { expiresIn: '1d' });

        await logActivity(businessId, newUserId, 'USER_REGISTER', `New admin user registered: ${name}.`);
        res.status(201).json({ message: 'Registrasi berhasil!', token });

    } catch (error) {
        await connection.rollback();
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/login', loginValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    let businessId = null;

    try {
        const [[user]] = await db.query(
            `SELECT u.*, r.name as role_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        businessId = user.business_id;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await logActivity(businessId, user.id, 'USER_LOGIN_FAILED', `User ${user.name} failed login (wrong password).`);
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        if (user.is_active === 0) {
            await logActivity(businessId, user.id, 'USER_LOGIN_FAILED', `User ${user.name} failed login (account inactive).`);
            return res.status(403).json({ message: 'Akun Anda tidak aktif. Silakan hubungi admin.' });
        }

        // Ambil semua izin (permissions) yang dimiliki oleh peran pengguna ini
        const [permissions] = await db.query(
            `SELECT p.name FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = ?`,
            [user.role_id]
        );
        const userPermissions = permissions.map(p => p.name);

        // Buat payload token yang lebih lengkap
        const tokenPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role_name,
            business_id: user.business_id,
            permissions: userPermissions // Simpan izin di dalam token
        };
        
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        await logActivity(businessId, user.id, 'USER_LOGIN', `User ${user.name} logged in.`);
        res.json({ message: 'Login berhasil!', token });

    } catch (error) {
        console.error("Login Error:", error);
        await logActivity(businessId || null, null, 'USER_LOGIN_ERROR', `Login attempt for ${email} failed. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/forgot-password', forgotPasswordValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    let businessId = null;

    try {
        const [[user]] = await db.query('SELECT id, name, business_id FROM users WHERE email = ? AND is_active = 1', [email]);

        if (!user) {
            return res.status(200).json({ message: 'Jika email terdaftar, tautan reset password telah dikirim.' });
        }

        businessId = user.business_id;

        const [[emailSettings]] = await db.query('SELECT sender_email, app_password, sender_name FROM email_settings WHERE business_id = ?', [businessId]);

        if (!emailSettings || !emailSettings.sender_email || !emailSettings.app_password) {
            await logActivity(businessId, user.id, 'FORGOT_PASSWORD_FAILED', `Email settings not configured for business ${businessId}.`);
            return res.status(500).json({ message: 'Pengaturan email bisnis belum dikonfigurasi. Hubungi admin.' });
        }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await db.query(
            'INSERT INTO password_resets (user_id, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?, created_at = CURRENT_TIMESTAMP',
            [user.id, resetToken, resetToken]
        );

        const decryptedAppPassword = decrypt(emailSettings.app_password);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSettings.sender_email,
                pass: decryptedAppPassword,
            },
        });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const mailOptions = {
            from: `"${emailSettings.sender_name || 'Smart POS'}" <${emailSettings.sender_email}>`,
            to: user.email,
            subject: 'Reset Password Smart POS Anda',
            html: `<p>Halo ${user.name},</p><p>Klik tautan berikut untuk mereset password Anda:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>`,
        };

        await transporter.sendMail(mailOptions);
        await logActivity(businessId, user.id, 'FORGOT_PASSWORD_REQUEST', `Password reset link sent to ${user.email}.`);
        res.status(200).json({ message: 'Jika email terdaftar, tautan reset password telah dikirim.' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        await logActivity(businessId || null, null, 'FORGOT_PASSWORD_ERROR', `Forgot password attempt for ${email} failed. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/reset-password/:token', resetPasswordValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;
    let userId = null;
    let businessId = null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;

        const [[resetEntry]] = await db.query('SELECT * FROM password_resets WHERE user_id = ? AND token = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)', [userId, token]);

        if (!resetEntry) {
            return res.status(400).json({ message: 'Tautan reset password tidak valid atau sudah kedaluwarsa.' });
        }

        const [[user]] = await db.query('SELECT business_id FROM users WHERE id = ? AND is_active = 1', [userId]);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau tidak aktif.' });
        }
        businessId = user.business_id;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        await db.query('DELETE FROM password_resets WHERE user_id = ?', [userId]);

        await logActivity(businessId, userId, 'PASSWORD_RESET_SUCCESS', `Password for user ID ${userId} reset successfully.`);
        res.status(200).json({ message: 'Password berhasil direset!' });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Tautan reset password sudah kedaluwarsa.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Tautan reset password tidak valid.' });
        }
        console.error("Reset Password Error:", error);
        await logActivity(businessId || null, userId || null, 'PASSWORD_RESET_FAILED', `Password reset failed. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.get('/profile', protect, (req, res) => {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, business_id: req.user.business_id, permissions: req.user.permissions });
});

// --- Admin-managed User Endpoints ---

router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [users] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at, u.is_active, r.name as role_name, u.role_id
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.business_id = ? AND u.is_active = 1
             ORDER BY u.created_at DESC`,
            [businessId]
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.get('/:id', protect, isAdmin, userIdValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userIdToFetch = req.params.id;
        const businessId = req.user.business_id;

        const [[user]] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at, u.is_active, r.name as role_name, u.role_id
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = ? AND u.business_id = ?`,
            [userIdToFetch, businessId]
        );

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau bukan milik bisnis Anda.' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching single user:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.post('/', protect, isAdmin, createUserValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role_id } = req.body;
    const businessId = req.user.business_id;
    const adminUserId = req.user.id;

    try {
        const [[existingUser]] = await db.query('SELECT id FROM users WHERE email = ? AND business_id = ?', [email, businessId]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email ini sudah digunakan di bisnis Anda.' });
        }

        const [[role]] = await db.query('SELECT id FROM roles WHERE id = ? AND business_id = ?', [role_id, businessId]);
        if (!role) {
            return res.status(400).json({ message: 'ID peran tidak valid atau bukan milik bisnis Anda.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await db.query(
            'INSERT INTO users (business_id, name, email, password, role_id) VALUES (?, ?, ?, ?, ?)',
            [businessId, name, email, hashedPassword, role_id]
        );

        await logActivity(businessId, adminUserId, 'CREATE_USER_BY_ADMIN', `Admin created new user: ${name} (ID: ${userResult.insertId}).`);
        res.status(201).json({ message: 'Pengguna berhasil ditambahkan!', userId: userResult.insertId });
    } catch (error) {
        console.error('Error creating user by admin:', error);
        await logActivity(businessId, adminUserId, 'CREATE_USER_BY_ADMIN_FAILED', `Failed to create user ${name}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.put('/:id', protect, isAdmin, userIdValidation, updateUserValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userIdToUpdate = req.params.id;
    const { name, email, password, role_id, is_active } = req.body;
    const businessId = req.user.business_id;
    const adminUserId = req.user.id;

    try {
        const [[targetUser]] = await db.query('SELECT email, role_id FROM users WHERE id = ? AND business_id = ?', [userIdToUpdate, businessId]);
        if (!targetUser) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau Anda tidak punya akses.' });
        }

        if (parseInt(userIdToUpdate) === adminUserId) {
            if (is_active !== undefined && is_active === 0) {
                return res.status(400).json({ message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' });
            }
            const [[currentAdminRole]] = await db.query('SELECT name FROM roles WHERE id = ?', [targetUser.role_id]);
            if (currentAdminRole && currentAdminRole.name.toLowerCase() === 'admin' && role_id !== targetUser.role_id) {
                const [[adminCount]] = await db.query(`
                    SELECT COUNT(u.id) as count
                    FROM users u
                    JOIN roles r ON u.role_id = r.id
                    WHERE u.business_id = ? AND r.name = 'admin' AND u.is_active = 1
                `, [businessId]);
                if (adminCount.count === 1) {
                    return res.status(400).json({ message: 'Anda tidak dapat mengubah peran Anda sendiri jika Anda adalah satu-satunya admin aktif.' });
                }
            }
        }

        if (email !== targetUser.email) {
            const [[emailExists]] = await db.query('SELECT id FROM users WHERE email = ? AND business_id = ? AND id != ?', [email, businessId, userIdToUpdate]);
            if (emailExists) {
                return res.status(400).json({ message: 'Email ini sudah digunakan oleh pengguna lain di bisnis Anda.' });
            }
        }

        const [[role]] = await db.query('SELECT id FROM roles WHERE id = ? AND business_id = ?', [role_id, businessId]);
        if (!role) {
            return res.status(400).json({ message: 'ID peran baru tidak valid atau bukan milik bisnis Anda.' });
        }

        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
        if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email); }
        if (role_id !== undefined) { updateFields.push('role_id = ?'); updateValues.push(role_id); }
        if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(is_active); }
        if (hashedPassword) { updateFields.push('password = ?'); updateValues.push(hashedPassword); }

        if (updateFields.length === 0) {
             return res.status(200).json({ message: 'Tidak ada perubahan yang dikirim.' });
        }

        updateValues.push(userIdToUpdate, businessId);

        const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND business_id = ?`;
        const [result] = await db.query(updateSql, updateValues);

        if (result.affectedRows === 0) {
            await logActivity(businessId, adminUserId, 'UPDATE_USER_FAILED', `Attempted to update user ID ${userIdToUpdate} but no changes made.`);
            return res.status(200).json({ message: 'Pengguna ditemukan tetapi tidak ada perubahan yang dibuat.' });
        }
        await logActivity(businessId, adminUserId, 'UPDATE_USER', `Admin updated user: ${name} (ID: ${userIdToUpdate}).`);
        res.json({ message: 'Pengguna berhasil diperbarui!' });
    } catch (error) {
        console.error('Error updating user:', error);
        await logActivity(businessId, adminUserId, 'UPDATE_USER_ERROR', `Error updating user ID ${userIdToUpdate}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

router.delete('/:id', protect, isAdmin, userIdValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userIdToDelete = req.params.id;
    const businessId = req.user.business_id;
    const adminUserId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [[userToDelete]] = await connection.query(
            `SELECT u.name, u.role_id, r.name as role_name
             FROM users u JOIN roles r ON u.role_id = r.id
             WHERE u.id = ? AND u.business_id = ? AND u.is_active = 1`,
            [userIdToDelete, businessId]
        );

        if (!userToDelete) {
            await connection.rollback();
            return res.status(404).json({ message: 'Pengguna tidak ditemukan atau sudah tidak aktif.' });
        }

        if (parseInt(userIdToDelete) === adminUserId) {
            await connection.rollback();
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
        }

        if (userToDelete.role_name.toLowerCase() === 'admin') {
            const [[adminCount]] = await connection.query(`
                SELECT COUNT(u.id) as count
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.business_id = ? AND r.name = 'admin' AND u.is_active = 1
            `, [businessId]);

            if (adminCount.count === 1) {
                await connection.rollback();
                return res.status(400).json({ message: 'Tidak dapat menghapus admin terakhir yang aktif di bisnis ini.' });
            }
        }

        const [result] = await connection.query(
            'UPDATE users SET is_active = 0 WHERE id = ? AND business_id = ?',
            [userIdToDelete, businessId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            throw new Error('Gagal menonaktifkan pengguna, kemungkinan masalah konkurensi.');
        }

        await connection.commit();
        await logActivity(businessId, adminUserId, 'DEACTIVATE_USER', `Admin deactivated user: ${userToDelete.name} (ID: ${userIdToDelete}).`);
        res.json({ message: 'Pengguna berhasil dinonaktifkan.' });

    } catch (error) {
        await connection.rollback();
        console.error('Error deactivating user:', error);
        await logActivity(businessId, adminUserId, 'DEACTIVATE_USER_FAILED', `Failed to deactivate user ID ${userIdToDelete}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;