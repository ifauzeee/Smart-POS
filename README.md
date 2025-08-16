# 🚀 Smart POS - Aplikasi Point of Sale Modern

Smart POS adalah aplikasi kasir (Point of Sale) berbasis web yang dirancang untuk membantu usaha kecil dan menengah mengelola transaksi, inventaris, dan pelanggan secara efisien. Dibangun dengan tumpukan teknologi modern, aplikasi ini menawarkan antarmuka yang responsif dan fungsionalitas offline.

## ✨ Fitur Utama

- **Manajemen Transaksi**: Proses penjualan yang cepat dan intuitif dengan dukungan multi-varian produk.
- **Manajemen Inventaris**: Pelacakan stok produk jadi dan bahan baku secara *real-time*, termasuk penyesuaian stok dan penerimaan barang.
- **Manajemen Pelanggan & Loyalitas**: Catat data pelanggan, lihat riwayat transaksi, dan kelola sistem poin loyalitas dengan katalog hadiah.
- **Laporan & Analitik**: Dashboard interaktif untuk memantau kinerja bisnis, termasuk pendapatan, laba, produk terlaris, dan performa kasir.
- **Manajemen Pengguna & Peran**: Sistem hak akses berbasis peran (*role-based access control*) untuk admin dan kasir.
- **Fungsionalitas Offline**: Transaksi tetap dapat dilakukan saat koneksi internet terputus dan akan disinkronkan secara otomatis saat kembali online.
- **Manajemen Pemasok & Pembelian**: Catat daftar pemasok dan kelola alur pesanan pembelian (*Purchase Orders*) dari draf hingga selesai.
- **Manajemen Promosi**: Buat dan kelola promosi berbasis persentase atau potongan harga tetap dengan kode kupon.
- **Manajemen Shift**: Fitur buka dan tutup shift untuk kasir dengan rekapitulasi penjualan per sesi.

## 🛠️ Tumpukan Teknologi

**Frontend:**
- [cite_start]**Framework**: React.js 18+ (dengan Vite) [cite: 151, 951]
- [cite_start]**Styling**: Styled Components [cite: 1, 151, 951]
- **Manajemen State**: React Context API & `useReducer`
- [cite_start]**Routing**: React Router DOM v6 [cite: 1, 151, 951]
- [cite_start]**HTTP Client**: Axios [cite: 1, 151, 951]
- [cite_start]**Database Offline**: Dexie.js (IndexedDB) [cite: 538, 951]
- [cite_start]**Notifikasi**: React Toastify [cite: 538, 951]
- [cite_start]**Animasi**: Framer Motion [cite: 538, 951]

**Backend:**
- [cite_start]**Framework**: Node.js dengan Express.js [cite: 156, 289]
- [cite_start]**Database**: MySQL / MariaDB [cite: 156, 289]
- [cite_start]**Otentikasi**: JSON Web Tokens (JWT) [cite: 156, 289]
- [cite_start]**Validasi**: Express Validator [cite: 156, 289]
- [cite_start]**Manajemen Upload**: Multer [cite: 156, 289]
- [cite_start]**Pengiriman Email**: Nodemailer [cite: 156, 289]

## 📦 Instalasi & Setup Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin lokal Anda.

### Prasyarat
- Node.js (v18 atau lebih tinggi)
- NPM atau Yarn
- Server Database MySQL atau MariaDB

### 1. Clone Repository
```bash
git clone [https://github.com/ifauzeee/Snart-POS.git](https://github.com/ifauzeee/Snart-POS.git)
cd Snart-POS
````

### 2\. Setup Backend

a. Masuk ke direktori backend.

```bash
cd backend
```

b. Install semua dependensi.

```bash
npm install
```

c. [cite\_start]Salin file `example.env` menjadi `.env` [cite: 152-153].

```bash
cp example.env .env
```

d. Buka file `.env` dan konfigurasikan variabel lingkungan Anda. **Ini adalah langkah yang sangat penting.**

e. Buat database baru di MySQL/MariaDB dengan nama yang Anda tentukan di `DB_NAME` pada file `.env`.

f. Impor struktur database menggunakan file skema SQL yang telah Anda siapkan.

g. Jalankan server backend.

```bash
npm start
```

[cite\_start]Server akan berjalan di `http://localhost:5000`[cite: 155].

### 3\. Setup Frontend

a. Buka terminal baru dan masuk ke direktori frontend dari root proyek.

```bash
cd frontend
```

b. Install semua dependensi.

```bash
npm install
```

c. Jalankan server development frontend.

```bash
npm run dev
```

[cite\_start]Aplikasi akan dapat diakses di `http://localhost:5173`[cite: 152, 952].

## 🔑 Konfigurasi Variabel Lingkungan (`.env` Backend)

File `.env` di dalam folder `backend` digunakan untuk menyimpan semua konfigurasi sensitif. Pastikan Anda mengisinya dengan benar.

  - [cite\_start]`DB_HOST`: Host database Anda (contoh: `localhost`). [cite: 152]
  - [cite\_start]`DB_USER`: Username untuk mengakses database (contoh: `root`). [cite: 152]
  - [cite\_start]`DB_PASSWORD`: Password database Anda. [cite: 152]
  - [cite\_start]`DB_NAME`: Nama database yang telah Anda buat. [cite: 152]
  - [cite\_start]`JWT_SECRET`: Kunci rahasia yang sangat panjang dan acak untuk menandatangani token JWT. [cite: 152]
  - [cite\_start]`ENCRYPTION_KEY`: Kunci rahasia dengan panjang **tepat 32 karakter** untuk enkripsi. [cite: 152]
  - [cite\_start]`ADMIN_REGISTRATION_KEY`: Kode unik yang digunakan untuk mendaftarkan akun admin pertama kali. [cite: 152]
  - [cite\_start]`FRONTEND_URL`: URL aplikasi frontend Anda (untuk development: `http://localhost:5173`). [cite: 152]
  - [cite\_start]`EMAIL_USER`: Alamat email Gmail Anda untuk mengirim struk. [cite: 152, 153]
  - [cite\_start]`EMAIL_PASS`: **Sandi Aplikasi 16 digit** dari akun Google Anda (bukan password login biasa). [cite: 152, 153]

-----

Dibuat dengan ❤️ oleh **ifauzeee**.