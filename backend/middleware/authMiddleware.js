// C:\Users\Ibnu\Project\smart-pos\backend\middleware\authMiddleware.js

const jwt = require('jsonwebtoken');
// PERBAIKAN: db tidak lagi diperlukan di sini karena data diambil dari token
// const db = require('../config/db');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // PERBAIKAN: Tidak perlu query ke database sama sekali.
            // Semua data yang dibutuhkan diambil langsung dari token yang sudah didekode.
            req.user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                business_id: decoded.business_id,
                role: decoded.role,
                permissions: decoded.permissions || [] // Pastikan permissions selalu array
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
    // Menggunakan optional chaining (?.) untuk mencegah error jika req.user atau req.user.role tidak ada
    if (req.user?.role?.toLowerCase() === 'admin') {
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