const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/users/register - Registrasi pengguna baru
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nama, email, dan password harus diisi.' });
  }

  try {
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM users');
    const finalRole = count === 0 ? 'admin' : 'kasir';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, email, hashedPassword, finalRole]);

    res.status(201).json({ 
      message: `Pengguna berhasil didaftarkan sebagai ${finalRole}!`,
      userId: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// POST /api/users/login - Login pengguna
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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login berhasil!',
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/users/profile - Mendapatkan profil user yang login
router.get('/profile', protect, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role
  });
});

// --- RUTE KHUSUS ADMIN ---

// GET /api/users - Mendapatkan semua pengguna
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    const [users] = await db.query('SELECT id, name, email, role FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// PUT /api/users/:id - Update pengguna
router.put('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  const { name, email, role } = req.body;

  try {
    await db.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, req.params.id]);
    res.json({ message: 'Pengguna berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// DELETE /api/users/:id - Hapus pengguna
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Akses ditolak." });
  }

  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

module.exports = router;