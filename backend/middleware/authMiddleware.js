// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                business_id: decoded.business_id,
                role: decoded.role,
                // PERBAIKAN: Sintaks array yang benar
                permissions: decoded.permissions || [] 
            };

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token not valid or expired.' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization failed.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role?.toLowerCase() === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

const hasPermission = (permissionName) => {
    return (req, res, next) => {
        // PERBAIKAN: Sintaks if-else yang benar
        if (req.user && req.user.permissions && req.user.permissions.includes(permissionName)) {
            next();
        } else {
            res.status(403).json({ message: `Akses ditolak. Izin '${permissionName}' diperlukan.` });
        }
    };
};

module.exports = { protect, isAdmin, hasPermission };