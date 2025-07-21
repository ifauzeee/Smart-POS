const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // 1. Cek apakah header 'Authorization' ada dan dimulai dengan 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Ambil token dari header ('Bearer <token>')
      token = req.headers.authorization.split(' ')[1];

      // 3. Verifikasi token menggunakan secret key yang sama
      const secretKey = 'RAHASIA_NEGARA_JANGAN_DIBAGI';
      const decoded = jwt.verify(token, secretKey);

      // 4. Lampirkan data pengguna yang sudah di-decode ke objek request
      // Ini membuat data pengguna bisa diakses di semua rute yang diproteksi
      req.user = decoded;

      // 5. Lanjutkan ke rute berikutnya
      next();

    } catch (error) {
      // Jika token tidak valid (misalnya, sudah kedaluwarsa)
      res.status(401).json({ message: 'Token tidak valid, otorisasi gagal.' });
    }
  }

  // Jika tidak ada token sama sekali
  if (!token) {
    res.status(401).json({ message: 'Tidak ada token, otorisasi gagal.' });
  }
};

module.exports = { protect };