# 🚀 Smart Point of Sale (POS)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Aplikasi web full-stack Point of Sale (POS) modern yang dibangun dari awal. Proyek ini dirancang untuk menjadi sistem kasir yang intuitif, cepat, dan kaya akan fitur, cocok untuk berbagai jenis bisnis ritel atau F&B.

![Smart POS Preview](https://i.postimg.cc/MKQQhTb8/gambar.png)

## ✨ Fitur Utama

- **Transaksi Real-time:** Proses penjualan yang cepat dengan manajemen keranjang belanja yang dinamis.
- **Manajemen Produk:** Antarmuka CRUD (Create, Read, Update, Delete) lengkap untuk mengelola inventaris produk.
- **Riwayat Transaksi:** Melihat, mencari, dan memeriksa detail semua transaksi yang pernah terjadi.
- **Dashboard Analitik:** Visualisasi data penjualan, produk terlaris, dan pendapatan untuk wawasan bisnis.
- **Otentikasi Aman:** Sistem login berbasis JWT (JSON Web Token) dengan enkripsi password.
- **Otorisasi Berbasis Peran:** Hak akses yang berbeda untuk peran 'Admin' dan 'Kasir'.
- **UI Modern & Responsif:** Dibangun dengan desain yang bersih, modern, dan pengalaman pengguna yang mulus.
- **Pencarian & Filter:** Menemukan produk dengan cepat berdasarkan nama.
- **Cetak Struk:** Fungsionalitas untuk mencetak struk transaksi ke printer kasir atau PDF.

## 💻 Tumpukan Teknologi (Tech Stack)

### **Frontend**
- **React.js:** Library JavaScript untuk membangun antarmuka pengguna.
- **Styled-Components:** Untuk styling CSS-in-JS yang rapi dan terisolasi.
- **React Router:** Untuk navigasi dan routing di sisi klien.
- **Axios:** Untuk melakukan permintaan HTTP ke backend API.
- **Framer Motion:** Untuk animasi antarmuka yang halus.
- **Recharts:** Untuk membuat grafik di halaman dashboard.
- **React-Toastify:** Untuk notifikasi yang elegan.

### **Backend**
- **Node.js:** Lingkungan eksekusi JavaScript di sisi server.
- **Express.js:** Framework minimalis untuk membangun REST API.
- **MySQL:** Sistem manajemen database relasional.
- **JWT (JSON Web Token):** Untuk otentikasi yang aman.
- **Bcrypt.js:** Untuk enkripsi password.

## 🛠️ Panduan Instalasi & Menjalankan Lokal

Untuk menjalankan proyek ini di komputer Anda, ikuti langkah-langkah berikut:

### **Prasyarat**
- [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
- [Git](https://git-scm.com/)
- [XAMPP](https://www.apachefriends.org/) atau server MySQL lainnya.

### **Langkah-langkah**

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/ifauzeee/Point-of-Sale.git](https://github.com/ifauzeee/Point-of-Sale.git)
    cd Point-of-Sale
    ```

2.  **Setup Backend:**
    - Buka terminal baru dan masuk ke folder backend: `cd backend`
    - Install semua dependensi: `npm install`
    - Buka XAMPP, nyalakan Apache dan MySQL.
    - Buat database baru di phpMyAdmin dengan nama `smart_pos_db`.
    - Impor file SQL (jika ada) atau jalankan query `CREATE TABLE` yang dibutuhkan.
    - Jalankan server backend: `npm start`
    - Server akan berjalan di `http://localhost:5000`.

3.  **Setup Frontend:**
    - Buka terminal baru dan masuk ke folder frontend: `cd frontend`
    - Install semua dependensi: `npm install`
    - Jalankan server development frontend: `npm run dev`
    - Aplikasi akan berjalan di `http://localhost:5173`.

4.  **Buka aplikasi** di browser Anda dan Anda siap untuk mulai!

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detailnya.

---

Dibuat dengan ❤️ oleh **Ibnu Fauzi**