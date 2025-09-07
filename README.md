# Smart POS - Aplikasi Point of Sale Modern

[](https://opensource.org/licenses/ISC)
[](https://reactjs.org/)
[](https://nodejs.org/)

\<div align="center"\>
\<a href="[https://ifauzeee.vercel.app/smart-pos-preview](https://ifauzeee.vercel.app/smart-pos-preview)" target="\_blank" rel="noopener noreferrer"\>
\<img src="[https://img.shields.io/badge/Lihat%20Live%20Preview-8E44AD?style=for-the-badge\&logo=react\&logoColor=white](https://www.google.com/search?q=https://img.shields.io/badge/Lihat%2520Live%2520Preview-8E44AD%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3Dwhite)" alt="Live Project Preview" /\>
\</a\>
\</div\>

**Smart POS** adalah aplikasi Point of Sale (POS) berbasis web yang modern, dirancang untuk membantu UMKM dan bisnis ritel mengelola operasi harian mereka dengan efisien. Dibangun dengan tumpukan teknologi modern (React.js dan Node.js/Express), aplikasi ini menawarkan antarmuka yang intuitif, manajemen data yang andal, dan analitik canggih untuk memberikan wawasan bisnis yang berharga.

Aplikasi ini mencakup semua fitur esensial dari sistem kasir, mulai dari pencatatan transaksi, manajemen inventaris, hingga pelaporan dan analisis kinerja, menjadikannya solusi lengkap untuk kebutuhan bisnis Anda.

## ✨ Fitur Utama

Proyek ini dilengkapi dengan serangkaian fitur yang komprehensif untuk mengelola seluruh aspek operasional bisnis:

#### 🛒 **Manajemen Transaksi & Kasir**

  - **Antarmuka Kasir Intuitif**: Proses transaksi cepat dengan pencarian produk dan pemilihan varian.
  - **Keranjang Dinamis**: Tambah, ubah kuantitas, dan hapus item dengan mudah.
  - **Dukungan Berbagai Metode Pembayaran**: Terima pembayaran tunai, kartu, dan QRIS.
  - **Manajemen Shift**: Mulai dan tutup shift kasir dengan perhitungan kas awal dan akhir yang otomatis.
  - **Tahan & Lanjutkan Transaksi**: Simpan keranjang belanja untuk dilanjutkan nanti.
  - **Struk Digital & Cetak**: Kirim struk melalui email atau cetak langsung.
  - **Mode Offline**: Transaksi dapat tetap berjalan saat koneksi internet terputus dan akan disinkronkan secara otomatis saat kembali online.

#### 📦 **Manajemen Inventaris**

  - **Daftar Produk & Varian**: Kelola produk dengan berbagai varian harga, modal, dan barcode.
  - **Manajemen Stok**: Lacak stok produk secara *real-time* dan dapatkan notifikasi untuk stok menipis atau habis.
  - **Manajemen Resep**: Hubungkan produk dengan bahan baku untuk pengurangan stok bahan secara otomatis saat penjualan.
  - **Penyesuaian Stok**: Lakukan stok opname atau catat barang rusak/retur.
  - **Manajemen Pemasok (Supplier)**: Simpan data pemasok untuk kemudahan pemesanan.
  - **Purchase Order (PO)**: Buat pesanan pembelian ke pemasok dan lacak statusnya.
  - **Manajemen Bahan Baku**: Kelola stok bahan mentah untuk produksi.

#### 📊 **Analitik & Pelaporan**

  - **Dasbor Komprehensif**: Pantau metrik kunci seperti pendapatan, laba, jumlah transaksi, dan pelanggan baru dalam rentang waktu yang dapat disesuaikan.
  - **Grafik Kinerja**: Visualisasikan tren penjualan harian, perbandingan laba vs pendapatan, dan produk terlaris.
  - **Analisis Profitabilitas**: Lihat laporan detail mengenai laba kotor dan marjin profit per produk.
  - **Laporan Kinerja Kasir**: Pantau performa penjualan setiap anggota tim.
  - **Ekspor Data**: Unduh laporan penjualan dan riwayat shift dalam format CSV.

#### 👥 **Manajemen Pengguna & Pelanggan**

  - **Manajemen Pengguna & Peran (Roles)**: Buat pengguna baru (Admin/Kasir) dengan hak akses yang dapat disesuaikan.
  - **Manajemen Pelanggan**: Simpan data pelanggan dan lihat riwayat transaksi mereka.
  - **Sistem Poin Loyalitas**: Pelanggan mendapatkan poin dari setiap transaksi.
  - **Penukaran Hadiah (Rewards)**: Kelola katalog hadiah yang dapat ditukarkan dengan poin.

#### ⚙️ **Pengaturan & Kustomisasi**

  - **Profil Bisnis**: Atur nama, alamat, logo, dan informasi kontak bisnis Anda.
  - **Pengaturan Struk**: Kustomisasi footer dan logo pada struk.
  - **Konfigurasi Email**: Atur email pengirim untuk struk digital.
  - **Manajemen Promosi**: Buat dan kelola diskon (persentase atau potongan tetap) dengan kode kupon.

-----

## 🚀 Tumpukan Teknologi (Tech Stack)

#### **Frontend**

  - **Framework**: [React.js](https://reactjs.org/) `^18.3.1`
  - **Build Tool**: [Vite](https://vitejs.dev/) `^5.4.8`
  - **Styling**: [Styled Components](https://styled-components.com/) `^6.1.13`
  - **Routing**: [React Router DOM](https://reactrouter.com/) `^6.27.0`
  - **State Management**: React Context API & `useReducer`
  - **Data Fetching**: [Axios](https://axios-http.com/) `^1.7.7`
  - **Grafik & Visualisasi**: [Recharts](https://recharts.org/) `^2.13.0`
  - **Penyimpanan Offline**: [Dexie.js](https://dexie.org/) (IndexedDB Wrapper) `^4.2.0`
  - **Notifikasi**: [React Toastify](https://fkhadra.github.io/react-toastify/) `^11.0.5`
  - **Animasi**: [Framer Motion](https://www.framer.com/motion/) `^12.23.12`

#### **Backend**

  - **Runtime**: [Node.js](https://nodejs.org/)
  - **Framework**: [Express.js](https://expressjs.com/) `^4.19.2`
  - **Database**: [MySQL 2](https://github.com/sidorares/node-mysql2) (Kompatibel dengan MySQL/MariaDB) `^3.10.0`
  - **Autentikasi**: [JSON Web Tokens (JWT)](https://jwt.io/) `^9.0.2`
  - **Keamanan**: [Bcrypt](https://www.google.com/search?q=https://github.com/kelektiv/node.bcrypt.js) (Password Hashing), `express-rate-limit` (Pencegahan Brute-force)
  - **Validasi**: [express-validator](https://express-validator.github.io/) `^7.1.0`
  - **Manajemen File**: [Multer](https://github.com/expressjs/multer) `^2.0.2` (Untuk unggah gambar)
  - **Pengiriman Email**: [Nodemailer](https://nodemailer.com/) `^6.9.14`

-----

## 🛠️ Instalasi & Setup Lokal

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah di bawah ini.

### **Prasyarat**

  - [Node.js](https://nodejs.org/) (v18 atau lebih tinggi)
  - [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)
  - Server Database [MySQL](https://www.mysql.com/) atau [MariaDB](https://mariadb.org/)

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

      - Buat sebuah database baru di MySQL/MariaDB Anda dengan nama `smart_pos_db`.
      - Impor skema database dari file `.sql` yang disediakan (jika ada) untuk membuat semua tabel yang diperlukan.

4.  **Konfigurasi Environment Variable:**

      - Salin file `example.env` menjadi file baru bernama `.env`.

    <!-- end list -->

    ```bash
    cp example.env .env
    ```

      - Buka file `.env` dan isi semua variabel sesuai dengan konfigurasi lokal Anda.

    <!-- end list -->

    ```env
    # Konfigurasi Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=smart_pos_db

    # Kunci Rahasia (Ganti dengan nilai acak yang kuat!)
    JWT_SECRET=ganti_dengan_kunci_jwt_acak_panjang
    ENCRYPTION_KEY=ganti_dengan_kunci_enkripsi_32_karakter
    ADMIN_REGISTRATION_KEY=ganti_dengan_frasa_unik

    # URL Frontend
    FRONTEND_URL=http://localhost:5173
    ```

5.  **Jalankan server backend:**

    ```bash
    npm start
    ```

    Server akan berjalan di `http://localhost:5000`.

### **2. Frontend Setup**

1.  **Navigasi ke direktori frontend:**

    ```bash
    cd frontend
    ```

2.  **Instal dependensi:**

    ```bash
    npm install
    ```

3.  **Jalankan server development frontend:**

    ```bash
    npm run dev
    ```

    Aplikasi akan terbuka secara otomatis di `http://localhost:5173`.

-----

## 🔑 Variabel Lingkungan (.env)

File `.env` di dalam direktori `backend` digunakan untuk mengonfigurasi variabel penting.

| Variabel                 | Contoh                                | Deskripsi                                                                                               |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `DB_HOST`                | `localhost`                           | Host server database Anda.                                                                              |
| `DB_USER`                | `root`                                | Nama pengguna untuk mengakses database.                                                                 |
| `DB_PASSWORD`            |                                       | Password untuk pengguna database.                                                                       |
| `DB_NAME`                | `smart_pos_db`                        | Nama database yang digunakan.                                                                           |
| `JWT_SECRET`             | `string_acak_sangat_panjang`          | Kunci rahasia untuk menandatangani JSON Web Tokens (JWT). **Wajib diganti\!** |
| `ENCRYPTION_KEY`         | `string_acak_tepat_32_karakter`       | Kunci rahasia untuk enkripsi data sensitif (seperti sandi aplikasi email). **Wajib diganti\!** |
| `ADMIN_REGISTRATION_KEY` | `frasa_rahasia_anda`                  | Kunci yang digunakan saat mendaftarkan akun admin pertama kali.                                         |
| `FRONTEND_URL`           | `http://localhost:5173`               | URL aplikasi frontend untuk mengizinkan permintaan CORS.                                                |
| `EMAIL_USER`             | `email.anda@gmail.com`                | Alamat email Gmail yang digunakan untuk mengirim struk.                                                 |
| `EMAIL_PASS`             | `sandi_aplikasi_16_digit`             | Sandi Aplikasi 16 digit dari akun Google Anda (bukan password login biasa).                               |

-----

## 🗺️ Struktur Proyek

```
smart-pos/
├── backend/
│   ├── config/
│   │   └── db.js               # Konfigurasi koneksi database
│   ├── middleware/
│   │   └── authMiddleware.js   # Middleware untuk otentikasi & otorisasi
│   ├── routes/                 # Definisi semua rute API
│   ├── services/
│   │   └── stockService.js     # Logika bisnis untuk manajemen stok
│   ├── utils/                  # Fungsi helper (enkripsi, logging, dll)
│   ├── index.js                # File entri utama server Express
│   ├── .env                    # Variabel lingkungan (tidak di-commit)
│   └── package.json
└── frontend/
    ├── public/                 # Aset statis
    ├── src/
    │   ├── components/         # Komponen UI yang dapat digunakan kembali
    │   ├── context/            # Penyedia state global (React Context)
    │   ├── hooks/              # Custom hooks
    │   ├── pages/              # Komponen halaman utama untuk setiap rute
    │   ├── services/
    │   │   └── api.js          # Konfigurasi Axios dan semua fungsi API call
    │   ├── utils/              # Fungsi helper (formatter, offline DB)
    │   ├── App.jsx             # Komponen root aplikasi & routing
    │   └── main.jsx            # Titik masuk aplikasi React
    ├── vite.config.js          # Konfigurasi Vite
    └── package.json
```

-----

## 📜 Lisensi

Proyek ini dilisensikan di bawah **Lisensi ISC**. Lihat file `LICENSE` untuk detail lebih lanjut.