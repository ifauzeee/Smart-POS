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
  - **Riwayat Transaksi:** Melihat daftar semua transaksi & detailnya.
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

## File 2: database/setup.sql (File Baru)

Agar pengguna lain tidak perlu membuat tabel satu per satu, kita sediakan file SQL ini.

    Di folder utama proyek Anda, buat folder baru bernama database.

    Di dalam folder database, buat file baru bernama setup.sql.

    Salin dan tempel seluruh query di bawah ini ke dalam file tersebut.

SQL

--
-- Script untuk setup database `smart_pos_db`
--

-- Membuat tabel 'users'
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','kasir') NOT NULL DEFAULT 'kasir',
  `smtp_email_user` varchar(255) DEFAULT NULL,
  `smtp_email_pass` varbinary(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Membuat tabel 'categories'
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Membuat tabel 'sub_categories'
CREATE TABLE `sub_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Membuat tabel 'products'
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `category_id` int(11) DEFAULT NULL,
  `sub_category_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `sub_category_id` (`sub_category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Membuat tabel 'orders'
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Membuat tabel 'order_items'
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Selesai --