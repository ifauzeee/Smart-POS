const jwt = require('jsonwebtoken');
const db = require('../config/db');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const [[user]] = await db.query('SELECT id, name, email, business_id, role_id FROM users WHERE id = ?', [decoded.id]);
            if (!user) {
                return res.status(401).json({ message: 'Pengguna tidak ditemukan.' });
            }

            const [[role]] = await db.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
            const [permissions] = await db.query(
                `SELECT p.name FROM permissions p
                 JOIN role_permissions rp ON p.id = rp.permission_id
                 WHERE rp.role_id = ?`,
                [user.role_id]
            );

            req.user = {
                ...user,
                role: decoded.role || (role ? role.name : null),
                permissions: permissions.map(p => p.name)
            };
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, otorisasi gagal.' });
    }
};

const isAdmin = (req, res, next) => {
    // --- PERBAIKAN DIMULAI ---
    // Menggunakan optional chaining (?.) untuk mencegah error jika req.user atau req.user.role tidak ada
    if (req.user?.role?.toLowerCase() === 'admin') {
    // --- PERBAIKAN SELESAI ---
        next();
    } else {
        return res.status(403).json({ 
            message: "Akses ditolak. Memerlukan peran admin.",
            receivedRole: req.user ? req.user.role : 'No role found' 
        });
    }
};

const hasPermission = (permission) => {
    return (req, res, next) => {
        if (req.user && req.user.permissions && req.user.permissions.includes(permission)) {
            next();
        } else {
            return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin yang diperlukan.' });
        }
    };
};

module.exports = { protect, isAdmin, hasPermission };