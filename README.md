# Smart POS - Aplikasi Point of Sale Modern

Smart POS adalah aplikasi kasir (Point of Sale) berbasis web yang lengkap, modern, dan dirancang untuk membantu mengelola berbagai aspek operasional bisnis, mulai dari transaksi penjualan, manajemen inventaris, hingga analisis kinerja. Aplikasi ini dibangun dengan tumpukan teknologi modern yang memastikan performa cepat, keamanan, dan fitur canggih seperti kemampuan bekerja secara offline.

## ✨ Fitur Utama

-   [cite_start]**Sistem Kasir (POS):** Antarmuka kasir yang intuitif untuk memproses transaksi dengan cepat[cite: 1109].
-   [cite_start]**Manajemen Produk:** Kelola produk dengan dukungan untuk varian (misal: ukuran, warna) dan resep yang terhubung dengan bahan baku[cite: 161, 399].
-   **Manajemen Inventaris:**
    -   [cite_start]Pelacakan stok *real-time*[cite: 543].
    -   [cite_start]Fitur penerimaan stok dari pemasok (Receive Stock)[cite: 1418].
    -   [cite_start]Penyesuaian stok manual (Stock Opname, Barang Rusak)[cite: 497].
-   [cite_start]**Manajemen Pesanan Pembelian (Purchase Orders):** Buat dan kelola pesanan ke pemasok[cite: 435].
-   [cite_start]**Manajemen Pelanggan & Loyalitas:** Catat data pelanggan dan kelola program poin loyalitas[cite: 359].
-   [cite_start]**Dashboard & Analitik:** Dapatkan wawasan mendalam tentang kinerja bisnis dengan metrik seperti total pendapatan, laba, produk terlaris, dan performa kasir[cite: 306].
-   [cite_start]**Manajemen Pengguna & Peran:** Sistem peran (Roles) dan izin (Permissions) yang fleksibel untuk membatasi akses pengguna[cite: 463].
-   [cite_start]**Manajemen Operasional:** Lacak pengeluaran, kelola shift kasir, dan atur promosi atau diskon[cite: 161, 421, 482].
-   [cite_start]**Kemampuan Bekerja Offline:** Transaksi dapat tetap dilakukan saat koneksi internet terputus dan akan disinkronkan secara otomatis saat kembali online[cite: 1131, 1132, 1133].
-   [cite_start]**Progressive Web App (PWA):** Dapat diinstal di perangkat desktop untuk pengalaman seperti aplikasi native[cite: 899, 900].
-   [cite_start]**Ekspor Laporan:** Ekspor data transaksi dan laporan lainnya ke format CSV untuk analisis lebih lanjut[cite: 455].

---

## 🛠️ Teknologi yang Digunakan

**Frontend:**
* [cite_start]**Framework:** React 18 [cite: 157]
* [cite_start]**Build Tool:** Vite [cite: 158]
* [cite_start]**Styling:** Styled Components [cite: 157]
* [cite_start]**Routing:** React Router DOM [cite: 157]
* [cite_start]**HTTP Client:** Axios [cite: 157]
* [cite_start]**Grafik & Chart:** Recharts [cite: 157]
* **Database Offline:** Dexie.js (IndexedDB Wrapper)
* **Animasi:** Framer Motion

**Backend:**
* [cite_start]**Framework:** Node.js & Express.js [cite: 303]
* [cite_start]**Database:** MySQL / MariaDB (via `mysql2`) [cite: 303]
* [cite_start]**Autentikasi:** JSON Web Tokens (JWT) [cite: 303]
* [cite_start]**Keamanan:** `bcrypt` untuk hashing password, `crypto` untuk enkripsi [cite: 303, 554]
* [cite_start]**Lainnya:** `Nodemailer` untuk pengiriman email, `Multer` untuk upload file [cite: 303]

---

## 🚀 Panduan Instalasi dan Konfigurasi

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lingkungan lokal Anda.

### 1. Prasyarat

Pastikan perangkat Anda telah terinstal perangkat lunak berikut:
* **Node.js:** Versi 18.x atau lebih tinggi.
* **npm:** Biasanya terinstal bersama Node.js.
* **Server Database:** MySQL atau MariaDB.

### 2. Pengaturan Database (MySQL/MariaDB)

1.  Buat sebuah database baru di server MySQL/MariaDB Anda. [cite_start]Nama database yang direkomendasikan adalah `smart_pos_db`[cite: 158].
2.  Jalankan skrip SQL berikut untuk membuat semua tabel yang diperlukan.

<details>
<summary><strong>Tampilkan Skrip SQL Lengkap</strong></summary>

```sql
CREATE TABLE `businesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(255) DEFAULT 'Toko Saya',
  `address` text DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `payment_methods` json DEFAULT '["Tunai", "Kartu", "QRIS"]',
  `receipt_logo_url` varchar(255) DEFAULT NULL,
  `receipt_footer_text` varchar(255) DEFAULT 'Terima kasih telah berbelanja!',
  `tax_rate` decimal(5,4) DEFAULT 0.0000,
  `default_starting_cash` decimal(15,2) DEFAULT 0.00,
  `monthly_revenue_target` decimal(15,2) DEFAULT 0.00,
  `cash_in_drawer` decimal(15,2) DEFAULT 0.00,
  `admin_created` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `role_permissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sub_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `sub_category_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `image_url` varchar(255) DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `is_archived` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `cost_price` decimal(15,2) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `raw_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `stock_quantity` decimal(15,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `cost_per_unit` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `recipes` (
  `product_id` int(11) NOT NULL,
  `raw_material_id` int(11) NOT NULL,
  `quantity_used` decimal(15,2) NOT NULL,
  PRIMARY KEY (`product_id`,`raw_material_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`raw_material_id`) REFERENCES `raw_materials`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('percentage','fixed_amount') NOT NULL,
  `value` decimal(15,2) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`business_id`,`code`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `subtotal_amount` decimal(15,2) NOT NULL,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `total_amount` decimal(15,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Tunai',
  `amount_paid` decimal(15,2) NOT NULL,
  `points_earned` int(11) DEFAULT 0,
  `promotion_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `cost_price` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sisanya (tabel opsional dan log) bisa Anda tambahkan sesuai kebutuhan
-- (Misal: expenses, shifts, dll.)
````

\</details\>

### 3\. Pengaturan Backend

1.  **Navigasi ke Direktori Backend:**

    ```bash
    cd backend
    ```

2.  **Instal Dependensi:**

    ```bash
    npm install
    ```

3.  **Konfigurasi Environment:**

      * [cite\_start]Salin file `example.env` menjadi `.env`[cite: 159].
        ```bash
        cp example.env .env
        ```
      * [cite\_start]Buka file `.env` dan isi semua variabel yang diperlukan sesuai dengan konfigurasi Anda[cite: 158]. Lihat bagian **Konfigurasi Environment** di bawah untuk detailnya.

4.  **Jalankan Server Backend:**

    ```bash
    npm start
    ```

    [cite\_start]Server akan berjalan di `http://localhost:5000` secara default[cite: 162].

### 4\. Pengaturan Frontend

1.  **Navigasi ke Direktori Frontend:**
    ```bash
    cd frontend
    ```
2.  **Instal Dependensi:**
    ```bash
    npm install
    ```
3.  **Jalankan Server Development Frontend:**
    ```bash
    npm run dev
    ```
    [cite\_start]Aplikasi akan tersedia di `http://localhost:5173`[cite: 158]. [cite\_start]Frontend sudah dikonfigurasi untuk berkomunikasi dengan backend di `http://localhost:5000`[cite: 1850].

-----

## ⚙️ Konfigurasi Environment (`.env`)

File `.env` di dalam direktori `backend` sangat penting untuk konfigurasi aplikasi. [cite\_start]Pastikan Anda mengisinya dengan benar dan **JANGAN PERNAH** mengunggah file ini ke repositori Git Anda[cite: 158].

| Variabel                 | Deskripsi                                                                                                                              | Contoh Nilai                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `DB_HOST`                | Alamat host server database Anda.                                                                                                      | `localhost`                                  |
| `DB_USER`                | Nama pengguna untuk mengakses database.                                                                                                | `root`                                       |
| `DB_PASSWORD`            | Password untuk pengguna database. Kosongkan jika tidak ada.                                                                            | `password_rahasia`                           |
| `DB_NAME`                | Nama database yang telah Anda buat.                                                                                                    | `smart_pos_db`                               |
| `DB_TIMEZONE`            | Zona waktu yang digunakan oleh server database.                                                                                        | `Asia/Jakarta`                               |
| `JWT_SECRET`             | Kunci rahasia yang sangat panjang dan acak untuk menandatangani token autentikasi (JWT). **Wajib diisi dengan nilai unik.** | `kunci_acak_yang_sangat_panjang_dan_aman`    |
| `ENCRYPTION_KEY`         | Kunci rahasia dengan panjang **tepat 32 karakter** untuk mengenkripsi data sensitif seperti password email. **Wajib diisi nilai unik.** | `kunci_enkripsi_aman_32_karakter_`         |
| `ADMIN_REGISTRATION_KEY` | Kode rahasia yang digunakan **hanya untuk registrasi admin pertama kali**. Ganti dengan kode yang sulit ditebak.                           | `"frasa_rahasia_untuk_admin_pertama"`        |
| `FRONTEND_URL`           | URL lengkap dari aplikasi frontend Anda. Penting untuk kebijakan CORS.                                                                 | `http://localhost:5173`                      |
| `EMAIL_USER`             | Alamat email Gmail yang akan digunakan untuk mengirim struk.                                                                           | `email.bisnis.anda@gmail.com`                |
| `EMAIL_PASS`             | **Sandi Aplikasi 16 digit** dari akun Google Anda, bukan password login biasa.                                                          | `sandi aplikasi 16 digit`                    |

-----

## 📝 Lisensi

[cite\_start]Proyek ini dilisensikan di bawah Lisensi ISC[cite: 163, 303].