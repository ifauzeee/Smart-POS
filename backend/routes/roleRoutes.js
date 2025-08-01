const express = require('express');
const db = require('../config/db');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/logUtils');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// --- Validation Rules ---

const roleValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama peran tidak boleh kosong.')
        .isLength({ max: 100 }).withMessage('Nama peran maksimal 100 karakter.'),
    body('description')
        .optional({ checkFalsy: true }) // Allow empty or null, but trim if present
        .trim()
        .isLength({ max: 500 }).withMessage('Deskripsi peran maksimal 500 karakter.'),
    body('permissions')
        .isArray().withMessage('Izin harus berupa array.')
        .custom(async (permissionIds, { req }) => {
            if (permissionIds.length === 0) {
                return true; // No permissions provided, which is valid
            }
            // Check if all provided permission IDs actually exist
            const [existingPermissions] = await db.query('SELECT id FROM permissions WHERE id IN (?)', [permissionIds]);
            const foundPermissionIds = new Set(existingPermissions.map(p => p.id));
            const invalidPermissions = permissionIds.filter(id => !foundPermissionIds.has(id));

            if (invalidPermissions.length > 0) {
                throw new Error(`ID izin tidak valid: ${invalidPermissions.join(', ')}`);
            }
            return true;
        })
];

const roleIdValidation = [
    param('id').isInt({ min: 1 }).withMessage('ID peran tidak valid.')
];

// --- Role Endpoints ---

/**
 * @route GET /api/roles
 * @desc Get all roles for the current business
 * @access Private (Admin only)
 */
router.get('/', protect, isAdmin, async (req, res) => {
    try {
        const businessId = req.user.business_id;
        // PERBAIKAN: Query disederhanakan untuk menghindari error kolom tidak ditemukan
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

/**
 * @route GET /api/roles/permissions
 * @desc Get all available permissions
 * @access Private (Admin only)
 */
router.get('/permissions', protect, isAdmin, async (req, res) => {
    try {
        const [permissions] = await db.query('SELECT id, name, description FROM permissions ORDER BY name ASC');
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route GET /api/roles/:id
 * @desc Get a single role's details including its assigned permissions
 * @access Private (Admin only)
 */
router.get('/:id', protect, isAdmin, roleIdValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const roleId = req.params.id;
        const businessId = req.user.business_id;

        const [[role]] = await db.query(
            'SELECT id, name, description FROM roles WHERE id = ? AND business_id = ?',
            [roleId, businessId]
        );
        if (!role) {
            return res.status(404).json({ message: 'Peran tidak ditemukan.' });
        }

        const [permissions] = await db.query(
            'SELECT permission_id FROM role_permissions WHERE role_id = ?',
            [roleId]
        );
        role.permissions = permissions.map(p => p.permission_id);
        res.json(role);
    } catch (error) {
        console.error('Error fetching role details:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * @route POST /api/roles
 * @desc Create a new role with assigned permissions
 * @access Private (Admin only)
 */
router.post('/', protect, isAdmin, roleValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, permissions } = req.body;
    const businessId = req.user.business_id;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check for duplicate role name within the same business
        const [[existingRole]] = await connection.query('SELECT id FROM roles WHERE business_id = ? AND name = ?', [businessId, name]);
        if (existingRole) {
            await connection.rollback();
            return res.status(409).json({ message: 'Nama peran sudah ada untuk bisnis ini.' });
        }

        const [roleResult] = await connection.query(
            'INSERT INTO roles (business_id, name, description) VALUES (?, ?, ?)',
            [businessId, name, description || null]
        );
        const roleId = roleResult.insertId;

        if (permissions && permissions.length > 0) {
            const permissionValues = permissions.map(pId => [roleId, pId]);
            await connection.query(
                'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
                [permissionValues]
            );
        }
        await connection.commit();
        await logActivity(businessId, userId, 'CREATE_ROLE', `Membuat peran baru: ${name} (ID: ${roleId}).`);
        res.status(201).json({ message: 'Peran berhasil dibuat.', roleId });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating role:', error);
        await logActivity(businessId, userId, 'CREATE_ROLE_FAILED', `Gagal membuat peran ${name}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * @route PUT /api/roles/:id
 * @desc Update an existing role and its assigned permissions
 * @access Private (Admin only)
 */
router.put('/:id', protect, isAdmin, roleIdValidation, roleValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, permissions } = req.body;
    const roleId = req.params.id;
    const businessId = req.user.business_id;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Verify role exists and belongs to the current business
        const [[originalRole]] = await connection.query('SELECT name FROM roles WHERE id = ? AND business_id = ?', [roleId, businessId]);
        if (!originalRole) {
            await connection.rollback();
            return res.status(404).json({ message: 'Peran tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        // Check for duplicate role name if changing
        if (originalRole.name !== name) {
            const [[duplicateNameRole]] = await connection.query('SELECT id FROM roles WHERE business_id = ? AND name = ? AND id != ?', [businessId, name, roleId]);
            if (duplicateNameRole) {
                await connection.rollback();
                return res.status(409).json({ message: 'Nama peran sudah digunakan oleh peran lain.' });
            }
        }

        const [updateResult] = await connection.query(
            'UPDATE roles SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?',
            [name, description || null, roleId, businessId]
        );

        if (updateResult.affectedRows === 0) {
            // This might occur if role exists but no fields were changed, or a concurrency issue
            // For now, we'll let it proceed to update permissions if any
        }

        // Delete old permissions and insert new ones
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
        if (permissions && permissions.length > 0) {
            const permissionValues = permissions.map(pId => [roleId, pId]);
            await connection.query(
                'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
                [permissionValues]
            );
        }
        await connection.commit();
        await logActivity(businessId, userId, 'UPDATE_ROLE', `Memperbarui peran: ${name} (ID: ${roleId}).`);
        res.json({ message: 'Peran berhasil diperbarui.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating role:', error);
        await logActivity(businessId, userId, 'UPDATE_ROLE_FAILED', `Gagal memperbarui peran ID ${roleId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * @route DELETE /api/roles/:id
 * @desc Delete a role
 * @access Private (Admin only)
 */
router.delete('/:id', protect, isAdmin, roleIdValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const roleId = req.params.id;
    const businessId = req.user.business_id;
    const userId = req.user.id;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Get role name for logging before deletion
        const [[roleName]] = await connection.query('SELECT name FROM roles WHERE id = ? AND business_id = ?', [roleId, businessId]);
        if (!roleName) {
            await connection.rollback();
            return res.status(404).json({ message: 'Peran tidak ditemukan atau Anda tidak punya akses.' });
        }

        // Check if any users are still assigned to this role
        const [[userCount]] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role_id = ? AND business_id = ?', [roleId, businessId]);
        if (userCount.count > 0) {
            await connection.rollback();
            return res.status(400).json({ message: `Tidak dapat menghapus peran karena masih digunakan oleh ${userCount.count} pengguna.` });
        }

        // Delete associated role_permissions first (due to foreign key constraints)
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

        const [result] = await connection.query(
            'DELETE FROM roles WHERE id = ? AND business_id = ?',
            [roleId, businessId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            throw new Error('Gagal menghapus peran, kemungkinan masalah konkurensi.');
        }

        await connection.commit();
        await logActivity(businessId, userId, 'DELETE_ROLE', `Menghapus peran: ${roleName.name} (ID: ${roleId}).`);
        res.json({ message: 'Peran berhasil dihapus.' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting role:', error);
        await logActivity(businessId, userId, 'DELETE_ROLE_FAILED', `Gagal menghapus peran ID ${roleId}. Error: ${error.message}`);
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;