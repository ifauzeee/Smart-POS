const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware'); // ✅ Tambahan middleware

const router = express.Router();

// Endpoint: POST /api/users/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password harus diisi.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    await db.query(sql, [name, email, hashedPassword, role || 'kasir']);

    res.status(201).json({ message: 'Pengguna berhasil didaftarkan!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Endpoint: POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi.' });
  }

  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [users] = await db.query(sql, [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      role: user.role
    };

    const secretKey = 'RAHASIA_NEGARA_JANGAN_DIBAGI';
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    res.json({
      message: 'Login berhasil!',
      token: token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// Endpoint: GET /api/users/profile (Rute Terproteksi)
router.get('/profile', protect, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role
  });
});

module.exports = router;
