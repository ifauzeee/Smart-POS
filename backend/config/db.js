const mysql = require('mysql2');

// Buat pool koneksi. Pool lebih efisien daripada membuat koneksi tunggal setiap saat.
const pool = mysql.createPool({
  host: 'localhost',      // Alamat server database Anda
  user: 'root',           // Username database (default XAMPP adalah 'root')
  password: '',           // Password database (default XAMPP adalah kosong)
  database: 'smart_pos_db', // Nama database yang kita buat
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ekspor promise-based pool agar bisa digunakan di file lain
module.exports = pool.promise();