# 🚀 Smart Point of Sale (POS)

[![Lisensi: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Dalam Pengembangan](https://img.shields.io/badge/status-in%20development-yellow.svg)](https://github.com/ifauzeee/Point-of-Sale)

Aplikasi web *full-stack* Point of Sale (POS) modern yang dibangun menggunakan stack MERN (MySQL, Express.js, React.js, Node.js). Proyek ini dirancang sebagai sistem kasir yang intuitif, cepat, dan kaya fitur untuk berbagai jenis bisnis ritel atau F&B.

**(Disarankan: Ambil screenshot baru dari halaman Produk atau Pemasok dan ganti link di bawah ini)**
![Smart POS Preview](https://i.postimg.cc/MKQQhTb8/gambar.png)

## ✨ Fitur Utama

-   **Otentikasi & Otorisasi:**
    -   Sistem Login & Registrasi aman (hashing password & JWT).
    -   Hak akses berbasis peran (Admin & Kasir) dengan menu dinamis.

-   **Manajemen Inventaris & Produk:**
    -   CRUD (Create, Read, Update, Delete) lengkap untuk **Produk**.
    -   Penambahan **Harga Beli (Modal)** untuk kalkulasi laba.
    -   **Ambang Batas Stok Rendah** untuk setiap produk.
    -   Peringatan visual di **Dashboard** untuk produk yang stoknya menipis.

-   **Manajemen Toko:**
    -   CRUD lengkap untuk **Pemasok (Supplier)**.
    -   Menghubungkan produk ke pemasoknya.
    -   Manajemen **Kategori & Sub-kategori** untuk pengelompokan produk.
    -   Admin dapat mengelola akun **Pengguna** lain (CRUD).

-   **Operasional Kasir:**
    -   Tampilan kasir (POS) dengan grid produk visual.
    -   Pencarian produk secara *real-time*.
    -   Keranjang belanja dinamis (tambah, kurang, hapus item).
    -   Proses checkout dengan kalkulasi kembalian.

-   **Fitur Pasca-Transaksi:**
    -   **Riwayat Transaksi** dengan detail per item.
    -   Admin dapat menghapus transaksi.
    -   Kirim **Struk Digital** ke email pelanggan (via Nodemailer & Gmail).
    -   Fungsionalitas untuk **Cetak Struk Fisik**.

-   **Analitik & Laporan:**
    -   Dashboard analitik dengan statistik penjualan harian.
    -   Visualisasi data penjualan & produk terlaris dengan grafik.

-   **Pengalaman Pengguna (UX):**
    -   **Theme Switcher**: Pilihan tema Terang (Light) dan Gelap (Dark).
    -   Notifikasi *Toast* yang informatif untuk semua aksi.
    -   *Loading skeleton* untuk pengalaman memuat data yang lebih baik.
    -   Desain responsif.

## 💻 Tumpukan Teknologi (Tech Stack)

-   **Frontend:** React.js, Styled-Components, Framer Motion, React Router, Axios, Recharts, React-Toastify
-   **Backend:** Node.js, Express.js, MySQL (MariaDB), JWT, Bcrypt.js, Nodemailer
-   **Database:** MySQL / MariaDB
-   **Development:** Git, VS Code, Vite, Nodemon

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### **Prasyarat**
-   [Node.js](https://nodejs.org/) (v18 atau lebih baru)
-   [Git](https://git-scm.com/)
-   [XAMPP](https://www.apachefriends.org/) (atau server MySQL/MariaDB lainnya)

### **Langkah 1: Clone Repository**
```bash
git clone [https://github.com/ifauzeee/Point-of-Sale.git](https://github.com/ifauzeee/Point-of-Sale.git)
cd Point-of-Sale
```

### **Langkah 2: Setup Database**
1.  Nyalakan **Apache** dan **MySQL** dari XAMPP Control Panel.
2.  Buka **phpMyAdmin** (`http://localhost/phpmyadmin`).
3.  Buat database baru dengan nama `smart_pos_db`.
4.  Pilih database `smart_pos_db`, lalu klik tab **"Import"**.
5.  Klik "Choose File" dan pilih file `database.sql` yang ada di dalam proyek ini.
6.  Klik **"Go"** atau **"Import"**.

### **Langkah 3: Setup Backend**
1.  Buka terminal baru dan masuk ke folder backend:
    ```bash
    cd backend
    ```
2.  Install semua dependensi:
    ```bash
    npm install
    ```
3.  Buat file `.env` di dalam folder `backend` dan isi seperti contoh di bawah (sesuaikan dengan konfigurasi Anda):
    ```env
    # Konfigurasi Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=smart_pos_db

    # Kunci Rahasia Enkripsi & JWT (Ganti dengan teks acak yang panjang)
    ENCRYPTION_KEY=iniadalahkuncirahasia32karakter!!
    JWT_SECRET=INI_ADALAH_KUNCI_SANGAT_RAHASIA_DAN_HARUS_DIGANTI

    # Konfigurasi Email (Opsional, untuk kirim struk)
    EMAIL_USER=emailanda@gmail.com
    EMAIL_PASS=16karakterapppasswordgoogleanda
    ```
4.  Jalankan server backend:
    ```bash
    npm start
    ```
    Server akan berjalan di `http://localhost:5000`.

### **Langkah 4: Setup Frontend**
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

### **Langkah 5: Akun Pertama**
- Buka aplikasi dan pergi ke halaman registrasi untuk membuat akun pertama. **Akun pertama yang dibuat akan otomatis menjadi Admin.**

## 🗺️ Roadmap (Rencana Pengembangan)

Berikut adalah beberapa fitur yang direncanakan untuk pengembangan selanjutnya:
-   [ ] **Manajemen Pelanggan (CRM)**: Menyimpan data pelanggan dan melacak riwayat transaksi mereka.
-   [ ] **Laporan Lanjutan**: Filter laporan berdasarkan tanggal dan ekspor data ke CSV/PDF.
-   [ ] **Dukungan Barcode Scanner**: Mempercepat input produk di halaman kasir.
-   [ ] **Manajemen Varian Produk**: Mengelola produk dengan berbagai ukuran, warna, atau tipe.

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detailnya.