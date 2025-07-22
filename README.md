# 🚀 Smart Point of Sale (POS)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Aplikasi web full-stack Point of Sale (POS) modern yang dibangun dari awal menggunakan stack MERN (MySQL, Express.js, React.js, Node.js). Proyek ini dirancang sebagai sistem kasir yang intuitif, cepat, dan kaya akan fitur, cocok untuk berbagai jenis bisnis ritel atau F&B.

![Smart POS Preview](https://i.postimg.cc/MKQQhTb8/gambar.png)

## ✨ Fitur Utama

- **Otentikasi & Otorisasi:**
  - Sistem Login & Registrasi yang aman (hashing password & JWT).
  - Hak akses berbasis peran (Admin & Kasir) dengan tampilan menu yang dinamis.
- **Manajemen Toko:**
  - **Manajemen Produk:** Antarmuka CRUD (Create, Read, Update, Delete) lengkap.
  - **Manajemen Kategori:** Membuat Kategori & Sub-kategori, termasuk gambar default.
  - **Manajemen Pengguna:** Admin dapat mengelola akun pengguna lain (CRUD).
- **Operasional Kasir:**
  - Tampilan kasir (POS) dengan grid produk visual.
  - Pencarian produk secara real-time.
  - Keranjang belanja dinamis (tambah, kurang, hapus item).
  - Proses checkout dengan kalkulasi kembalian.
- **Fitur Pasca-Transaksi:**
  - **Riwayat Transaksi:** Melihat daftar semua transaksi, detail per item, dan menghapus transaksi (khusus admin).
  - **Struk Digital:** Mengirim struk ke email pelanggan melalui Nodemailer & Gmail.
  - **Cetak Struk:** Fungsionalitas untuk mencetak struk fisik.
- **Business Intelligence:**
  - Dashboard analitik dengan statistik penjualan harian.
  - Visualisasi data penjualan & produk terlaris dengan grafik.
- **Pengalaman Pengguna (UX):**
  - **Theme Switcher:** Opsi untuk beralih antara tema Terang (Light) dan Gelap (AMOLED Dark).
  - Notifikasi Toast yang elegan untuk semua aksi.
  - Loading skeleton untuk memuat data.
  - Desain responsif untuk diakses melalui HP/Tablet di jaringan lokal.

## 💻 Tumpukan Teknologi (Tech Stack)

- **Frontend:** React.js, Styled-Components, Framer Motion, React Router, Axios, Recharts, React-Toastify
- **Backend:** Node.js, Express.js, MySQL (MariaDB), JWT, Bcrypt.js, Nodemailer
- **Database:** MySQL / MariaDB
- **Development:** Git, VS Code, Vite

## 🛠️ Panduan Instalasi & Menjalankan Lokal

Untuk menjalankan proyek ini di komputer Anda, ikuti langkah-langkah berikut:

### **Prasyarat**
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [Git](https://git-scm.com/)
- [XAMPP](https://www.apachefriends.org/) (atau server MySQL/MariaDB lainnya)

### **Langkah 1: Setup Database**

1.  Nyalakan **Apache** dan **MySQL** dari XAMPP Control Panel.
2.  Buka **phpMyAdmin** (`http://localhost/phpmyadmin`).
3.  Buat database baru dengan nama `smart_pos_db`.
4.  Pilih database `smart_pos_db` tersebut, lalu klik tab **"Import"**.
5.  Klik "Choose File" dan pilih file `setup.sql` yang ada di dalam folder `database` proyek ini.
6.  Klik **"Go"** atau **"Import"**. Semua tabel yang dibutuhkan akan otomatis dibuat.

### **Langkah 2: Setup Backend**

1.  Buka terminal baru dan masuk ke folder backend:
    ```bash
    cd backend
    ```
2.  Install semua dependensi:
    ```bash
    npm install
    ```
3.  Buat file `.env` di dalam folder `backend` dengan menyalin dari `.env.example` (jika ada) atau buat baru dan isi seperti ini:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=smart_pos_db
    ENCRYPTION_KEY=iniadalahkuncirahasia32karakter!!
    JWT_SECRET=INI_ADALAH_KUNCI_SANGAT_RAHASIA
    EMAIL_USER=emailanda@gmail.com
    EMAIL_PASS=16karakterapppasswordanda
    ```
4.  Jalankan server backend:
    ```bash
    npm start
    ```
    Server akan berjalan di `http://localhost:5000`.

### **Langkah 3: Setup Frontend**

1.  Buka terminal baru dan masuk ke folder frontend:
    ```bash
    cd frontend
    ```
2.  Install semua dependensi:
    ```bash
    npm install
    ```
3.  Jalankan server development frontend:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:5173`.

### **Langkah 4: Akun Pertama**
-   Buka aplikasi dan pergi ke halaman registrasi untuk membuat akun pertama Anda. **Akun pertama yang dibuat akan otomatis menjadi Admin.**

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detailnya.