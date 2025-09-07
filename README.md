# Smart POS - Aplikasi Point of Sale Modern

[![Lisensi: ISC](https://img.shields.io/badge/Lisensi-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Framework: React](https://img.shields.io/badge/Framework-React-blue.svg)](https://reactjs.org/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)

<div align="center">
  <a href="https://ifauzeee.vercel.app/smart-pos-preview" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Lihat%20Live%20Preview-8E44AD?style=for-the-badge&logo=react&logoColor=white" alt="Live Project Preview" />
  </a>
</div>

**Smart POS** adalah aplikasi Point of Sale (POS) berbasis web yang modern, dirancang untuk membantu UMKM dan bisnis ritel mengelola operasi harian mereka dengan efisien. Dibangun dengan tumpukan teknologi modern (React.js dan Node.js/Express), aplikasi ini menawarkan antarmuka yang intuitif, manajemen data yang andal, dan analitik canggih untuk memberikan wawasan bisnis yang berharga.

Aplikasi ini mencakup semua fitur esensial dari sistem kasir, mulai dari pencatatan transaksi, manajemen inventaris, hingga pelaporan dan analisis kinerja, menjadikannya solusi lengkap untuk kebutuhan bisnis Anda.

## ✨ Fitur Utama

Proyek ini dilengkapi dengan serangkaian fitur yang komprehensif untuk mengelola seluruh aspek operasional bisnis:

#### 🛒 **Manajemen Transaksi & Kasir**
- [cite_start]**Antarmuka Kasir Intuitif**: Proses transaksi cepat dengan pencarian produk dan pemilihan varian[cite: 1299].
- [cite_start]**Keranjang Dinamis**: Tambah, ubah kuantitas, dan hapus item dengan mudah[cite: 1308, 1309].
- [cite_start]**Dukungan Berbagai Metode Pembayaran**: Terima pembayaran tunai, kartu, dan QRIS[cite: 924].
- [cite_start]**Manajemen Shift**: Mulai dan tutup shift kasir dengan perhitungan kas awal dan akhir yang otomatis[cite: 1122, 935].
- [cite_start]**Tahan & Lanjutkan Transaksi**: Simpan keranjang belanja untuk dilanjutkan nanti[cite: 1322].
- [cite_start]**Struk Digital & Cetak**: Kirim struk melalui email atau cetak langsung[cite: 998, 1008].
- [cite_start]**Mode Offline**: Transaksi dapat tetap berjalan saat koneksi internet terputus dan akan disinkronkan secara otomatis saat kembali online[cite: 1321, 1132].

#### 📦 **Manajemen Inventaris**
- [cite_start]**Daftar Produk & Varian**: Kelola produk dengan berbagai varian harga, modal, dan barcode[cite: 1040, 1041, 1043].
- [cite_start]**Manajemen Stok**: Lacak stok produk secara *real-time* dan dapatkan notifikasi untuk stok menipis atau habis[cite: 323, 324].
- [cite_start]**Manajemen Resep**: Hubungkan produk dengan bahan baku untuk pengurangan stok bahan secara otomatis saat penjualan[cite: 1372].
- [cite_start]**Penyesuaian Stok**: Lakukan stok opname atau catat barang rusak/retur[cite: 497].
- [cite_start]**Manajemen Pemasok (Supplier)**: Simpan data pemasok untuk kemudahan pemesanan[cite: 1672].
- [cite_start]**Purchase Order (PO)**: Buat pesanan pembelian ke pemasok dan lacak statusnya[cite: 1435].
- [cite_start]**Manajemen Bahan Baku**: Kelola stok bahan mentah untuk produksi[cite: 1513].

#### 📊 **Analitik & Pelaporan**
- [cite_start]**Dasbor Komprehensif**: Pantau metrik kunci seperti pendapatan, laba, jumlah transaksi, dan pelanggan baru dalam rentang waktu yang dapat disesuaikan[cite: 305, 306, 307].
- [cite_start]**Grafik Kinerja**: Visualisasikan tren penjualan harian, perbandingan laba vs pendapatan, dan produk terlaris[cite: 311, 316].
- [cite_start]**Analisis Profitabilitas**: Lihat laporan detail mengenai laba kotor dan marjin profit per produk[cite: 1383].
- [cite_start]**Laporan Kinerja Kasir**: Pantau performa penjualan setiap anggota tim[cite: 320].
- [cite_start]**Ekspor Data**: Unduh laporan penjualan dan riwayat shift dalam format CSV[cite: 393, 492].

#### 👥 **Manajemen Pengguna & Pelanggan**
- [cite_start]**Manajemen Pengguna & Peran (Roles)**: Buat pengguna baru (Admin/Kasir) dengan hak akses yang dapat disesuaikan[cite: 1715, 1582].
- [cite_start]**Manajemen Pelanggan**: Simpan data pelanggan dan lihat riwayat transaksi mereka[cite: 1224].
- [cite_start]**Sistem Poin Loyalitas**: Pelanggan mendapatkan poin dari setiap transaksi[cite: 384].
- [cite_start]**Penukaran Hadiah (Rewards)**: Kelola katalog hadiah yang dapat ditukarkan dengan poin[cite: 461].

#### ⚙️ **Pengaturan & Kustomisasi**
- [cite_start]**Profil Bisnis**: Atur nama, alamat, logo, dan informasi kontak bisnis Anda[cite: 472].
- [cite_start]**Pengaturan Struk**: Kustomisasi footer dan logo pada struk[cite: 473].
- [cite_start]**Konfigurasi Email**: Atur email pengirim untuk struk digital[cite: 477].
- [cite_start]**Manajemen Promosi**: Buat dan kelola diskon (persentase atau potongan tetap) dengan kode kupon[cite: 1433].

---

## 🚀 Tumpukan Teknologi (Tech Stack)

#### **Frontend**
- [cite_start]**Framework**: [React.js](https://reactjs.org/) `^18.3.1` [cite: 901]
- [cite_start]**Build Tool**: [Vite](https://vitejs.dev/) `^5.4.8` [cite: 901]
- [cite_start]**Styling**: [Styled Components](https://styled-components.com/) `^6.1.13` [cite: 901]
- [cite_start]**Routing**: [React Router DOM](https://reactrouter.com/) `^6.27.0` [cite: 901]
- [cite_start]**State Management**: React Context API & `useReducer` [cite: 1149, 1155, 1157, 1309]
- [cite_start]**Data Fetching**: [Axios](https://axios-http.com/) `^1.7.7` [cite: 901]
- [cite_start]**Grafik & Visualisasi**: [Recharts](https://recharts.org/) `^2.13.0` [cite: 901]
- [cite_start]**Penyimpanan Offline**: [Dexie.js](https://dexie.org/) (IndexedDB Wrapper) `^4.2.0` [cite: 901]
- [cite_start]**Notifikasi**: [React Toastify](https://fkhadra.github.io/react-toastify/) `^11.0.5` [cite: 901]
- [cite_start]**Animasi**: [Framer Motion](https://www.framer.com/motion/) `^12.23.12` [cite: 901]

#### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/)
- [cite_start]**Framework**: [Express.js](https://expressjs.com/) `^4.19.2` [cite: 301]
- [cite_start]**Database**: [MySQL 2](https://github.com/sidorares/node-mysql2) (Kompatibel dengan MySQL/MariaDB) `^3.10.0` [cite: 301]
- [cite_start]**Autentikasi**: [JSON Web Tokens (JWT)](https://jwt.io/) `^9.0.2` [cite: 301]
- [cite_start]**Keamanan**: [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) (Password Hashing), `express-rate-limit` (Pencegahan Brute-force) [cite: 301, 159]
- [cite_start]**Validasi**: [express-validator](https://express-validator.github.io/) `^7.1.0` [cite: 301]
- [cite_start]**Manajemen File**: [Multer](https://github.com/expressjs/multer) `^2.0.2` (Untuk unggah gambar) [cite: 301]
- [cite_start]**Pengiriman Email**: [Nodemailer](https://nodemailer.com/) `^6.9.14` [cite: 301]

---

## 🛠️ Instalasi & Setup Lokal

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah di bawah ini.

### **Prasyarat**
- [Node.js](https://nodejs.org/) (v18 atau lebih tinggi direkomendasikan)
- [npm](https://www.npmjs.com/) (terinstal bersama Node.js)
- Server Database [MySQL](https://www.mysql.com/) atau [MariaDB](https://mariadb.org/)

### **Memulai**
1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/ifauzeee/Smart-POS.git](https://github.com/ifauzeee/Smart-POS.git)
    cd Smart-POS
    ```

### **1. Backend Setup**

1.  **Navigasi ke direktori backend:**
    ```bash
    cd backend
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Setup Database:**
    - [cite_start]Buat sebuah database baru di server MySQL/MariaDB Anda dengan nama `smart_pos_db`[cite: 157].
    - **Impor skema database** dari file `backend/database/schema.sql` untuk membuat semua tabel yang diperlukan secara otomatis.

4.  **Konfigurasi Environment Variable:**
    - [cite_start]Salin file `example.env` menjadi file baru bernama `.env`[cite: 158].
    ```bash
    cp example.env .env
    ```
    - Buka file `.env` dan isi semua variabel sesuai dengan konfigurasi lokal Anda.

5.  **Jalankan server backend:**
    ```bash
    npm start
    ```
    [cite_start]Server akan berjalan di `http://localhost:5000`[cite: 161].

### **2. Frontend Setup**

1.  **Navigasi ke direktori frontend:**
    ```bash
    cd ../frontend
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    ```

3.  **Jalankan server development frontend:**
    ```bash
    npm run dev
    ```
    [cite_start]Aplikasi akan terbuka secara otomatis di `http://localhost:5173`[cite: 903].

---

## 🔑 Variabel Lingkungan (.env)

File `.env` di dalam direktori `backend` digunakan untuk mengonfigurasi variabel penting. Pastikan Anda mengisinya sebelum menjalankan server.

| Variabel                 | Contoh                                | Deskripsi                                                                                               |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DB_HOST`                | `localhost`                           | [cite_start]Host server database Anda[cite: 157].                                                                              |
| `DB_USER`                | `root`                                | [cite_start]Nama pengguna untuk mengakses database[cite: 157].                                                                 |
| `DB_PASSWORD`            |                                       | [cite_start]Password untuk pengguna database[cite: 157].                                                                       |
| `DB_NAME`                | `smart_pos_db`                        | [cite_start]Nama database yang digunakan[cite: 157].                                                                           |
| `JWT_SECRET`             | `string_acak_sangat_panjang`          | Kunci rahasia untuk menandatangani JSON Web Tokens (JWT). [cite_start]**Wajib diganti!** [cite: 157] |
| `ENCRYPTION_KEY`         | `string_acak_tepat_32_karakter`       | Kunci rahasia untuk enkripsi data sensitif (seperti sandi aplikasi email). [cite_start]**Wajib diganti!** [cite: 157] |
| `ADMIN_REGISTRATION_KEY` | `frasa_rahasia_anda`                  | [cite_start]Kunci yang digunakan saat mendaftarkan akun admin pertama kali[cite: 157].                                         |
| `FRONTEND_URL`           | `http://localhost:5173`               | [cite_start]URL aplikasi frontend untuk mengizinkan permintaan CORS[cite: 157].                                                |
| `EMAIL_USER`             | `email.anda@gmail.com`                | [cite_start]Alamat email Gmail yang digunakan untuk mengirim struk[cite: 158].                                                 |
| `EMAIL_PASS`             | `sandi_aplikasi_16_digit`             | [cite_start]Sandi Aplikasi 16 digit dari akun Google Anda (bukan password login biasa)[cite: 158].                               |

---

## 🗺️ Struktur Proyek

````

smart-pos/
├── backend/
│   ├── config/
│   │   └── db.js               \# Konfigurasi koneksi database
│   ├── middleware/
│   │   └── authMiddleware.js   \# Middleware untuk otentikasi & otorisasi
│   ├── routes/                 \# Definisi semua rute API
│   ├── services/
│   │   └── stockService.js     \# Logika bisnis untuk manajemen stok
│   ├── utils/                  \# Fungsi helper (enkripsi, logging, dll)
│   ├── index.js                \# File entri utama server Express
│   ├── .env                    \# Variabel lingkungan (tidak di-commit)
│   └── package.json
└── frontend/
├── public/                 \# Aset statis
├── src/
│   ├── components/         \# Komponen UI yang dapat digunakan kembali
│   ├── context/            \# Penyedia state global (React Context)
│   ├── hooks/              \# Custom hooks
│   ├── pages/              \# Komponen halaman utama untuk setiap rute
│   ├── services/
│   │   └── api.js          \# Konfigurasi Axios dan semua fungsi API call
│   ├── utils/              \# Fungsi helper (formatter, offline DB)
│   ├── App.jsx             \# Komponen root aplikasi & routing
│   └── main.jsx            \# Titik masuk aplikasi React
├── vite.config.js          \# Konfigurasi Vite
└── package.json

```

---

## 📜 Lisensi

[cite_start]Proyek ini dilisensikan di bawah **Lisensi ISC**[cite: 301].