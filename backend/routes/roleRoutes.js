// C:\Users\Ibnu\Project\smart-pos\backend\routes\roleRoutes.js

const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

const roleValidationRules = [
    body('name').trim().notEmpty().withMessage('Nama peran tidak boleh kosong.'),
    body('description').optional({ checkFalsy: true }).trim(),
    body('permissions').isArray().withMessage('Izin harus berupa array.')
];

const roleIdValidation = [
    param('id').isInt({ min: 1 }).withMessage('ID peran tidak valid.')
];

// PERBAIKAN: Query disederhanakan untuk menghindari error kolom tidak ditemukan
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        const [roles] = await db.query(
            'SELECT id, name FROM roles WHERE business_id = ? ORDER BY name ASC',
            [businessId]
        );
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Sisa file tidak berubah
router.get('/permissions', protect, isAdmin, async (req, res) => {
    try {
        const [permissions] = await db.query('SELECT id, name, description FROM permissions ORDER BY name ASC');
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
router.get('/:id', protect, isAdmin, roleIdValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const roleId = req.params.id;
        const businessId = req.user.business_id;
        const [[role]] = await db.query('SELECT id, name, description FROM roles WHERE id = ? AND business_id = ?', [roleId, businessId]);
        if (!role) return res.status(404).json({ message: 'Peran tidak ditemukan.' });
        const [permissions] = await db.query('SELECT permission_id FROM role_permissions WHERE role_id = ?', [roleId]);
        role.permissions = permissions.map(p => p.permission_id);
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
router.post('/', protect, isAdmin, roleValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, description, permissions } = req.body;
    const { business_id: businessId, id: userId } = req.user;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[existingRole]] = await connection.query('SELECT id FROM roles WHERE business_id = ? AND name = ?', [businessId, name]);
        if (existingRole) {
            await connection.rollback();
            return res.status(409).json({ message: 'Nama peran sudah ada.' });
        }
        const [roleResult] = await connection.query('INSERT INTO roles (business_id, name, description) VALUES (?, ?, ?)', [businessId, name, description || null]);
        const roleId = roleResult.insertId;
        if (permissions && permissions.length > 0) {
            const permissionValues = permissions.map(pId => [roleId, pId]);
            await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [permissionValues]);
        }
        await connection.commit();
        await logActivity(businessId, userId, 'CREATE_ROLE', `Membuat peran: ${name} (ID: ${roleId}).`);
        res.status(201).json({ message: 'Peran berhasil dibuat.', roleId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});
router.put('/:id', protect, isAdmin, roleIdValidation, roleValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, description, permissions } = req.body;
    const roleId = req.params.id;
    const { business_id: businessId, id: userId } = req.user;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[originalRole]] = await connection.query('SELECT name FROM roles WHERE id = ? AND business_id = ?', [roleId, businessId]);
        if (!originalRole) {
            await connection.rollback();
            return res.status(404).json({ message: 'Peran tidak ditemukan.' });
        }
        if (originalRole.name !== name) {
            const [[duplicateNameRole]] = await connection.query('SELECT id FROM roles WHERE business_id = ? AND name = ? AND id != ?', [businessId, name, roleId]);
            if (duplicateNameRole) {
                await connection.rollback();
                return res.status(409).json({ message: 'Nama peran sudah digunakan.' });
            }
        }
        await connection.query('UPDATE roles SET name = ?, description = ? WHERE id = ? AND business_id = ?', [name, description || null, roleId, businessId]);
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
        if (permissions && permissions.length > 0) {
            const permissionValues = permissions.map(pId => [roleId, pId]);
            await connection.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [permissionValues]);
        }
        await connection.commit();
        await logActivity(businessId, userId, 'UPDATE_ROLE', `Memperbarui peran: ${name} (ID: ${roleId}).`);
        res.json({ message: 'Peran berhasil diperbarui.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});
router.delete('/:id', protect, isAdmin, roleIdValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const roleId = req.params.id;
    const { business_id: businessId, id: userId } = req.user;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [[roleName]] = await connection.query('SELECT name FROM roles WHERE id = ? AND business_id = ?', [roleId, businessId]);
        if (!roleName) {
            await connection.rollback();
            return res.status(404).json({ message: 'Peran tidak ditemukan.' });
        }
        const [[userCount]] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role_id = ? AND business_id = ?', [roleId, businessId]);
        if (userCount.count > 0) {
            await connection.rollback();
            return res.status(400).json({ message: `Tidak dapat menghapus peran karena masih digunakan oleh ${userCount.count} pengguna.` });
        }
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
        await connection.query('DELETE FROM roles WHERE id = ? AND business_id = ?', [roleId, businessId]);
        await connection.commit();
        await logActivity(businessId, userId, 'DELETE_ROLE', `Menghapus peran: ${roleName.name} (ID: ${roleId}).`);
        res.json({ message: 'Peran berhasil dihapus.' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;