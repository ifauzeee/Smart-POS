// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');

// --- PERBAIKAN DIMULAI ---
// Pastikan direktori uploads ada saat aplikasi dimulai
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Buat nama file yang unik untuk menghindari konflik
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter untuk hanya menerima file gambar
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Format file tidak didukung! Hanya JPEG, PNG, WEBP, dan GIF yang diizinkan.'), false);
    }
};

// Konfigurasi Multer dengan validasi
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Batas ukuran file 5 MB
    },
    fileFilter: fileFilter
});
// --- PERBAIKAN SELESAI ---


// POST route for image upload
router.post('/image', protect, (req, res) => {
    const uploadSingle = upload.single('image');

    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Error dari Multer (misal: file terlalu besar)
            return res.status(400).json({ message: `Error Multer: ${err.message}` });
        } else if (err) {
            // Error dari fileFilter atau error lainnya
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file yang diunggah.' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ message: 'Gambar berhasil diunggah', url: imageUrl });
    });
});

module.exports = router;