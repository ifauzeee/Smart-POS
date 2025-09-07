<div align="center">
  <img src="https://www.freeiconspng.com/thumbs/point-of-sale-icon/point-of-sale-icon-9.png" alt="Smart POS Icon" width="128" />
</div>

<h1 align="center">Smart POS - Aplikasi Point of Sale Modern</h1>

<div align="center">
  
[![Lisensi: ISC](https://img.shields.io/badge/Lisensi-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Framework: React](https://img.shields.io/badge/Framework-React-blue.svg)](https://reactjs.org/)
[![Backend: Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)

</div>

<div align="center" style="margin-top: 20px;">
  <a href="https://ifauzeee.vercel.app/smart-pos-preview" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Lihat%20Live%20Preview-8E44AD?style=for-the-badge&logo=react&logoColor=white" alt="Live Project Preview" />
  </a>
</div>

**Smart POS** adalah aplikasi Point of Sale (POS) berbasis web yang modern, dirancang untuk membantu UMKM dan bisnis ritel mengelola operasi harian mereka dengan efisien. Dibangun dengan tumpukan teknologi modern (React.js dan Node.js/Express), aplikasi ini menawarkan antarmuka yang intuitif, manajemen data yang andal, dan analitik canggih untuk memberikan wawasan bisnis yang berharga.

Aplikasi ini mencakup semua fitur esensial dari sistem kasir, mulai dari pencatatan transaksi, manajemen inventaris, hingga pelaporan dan analisis kinerja, menjadikannya solusi lengkap untuk kebutuhan bisnis Anda.

---

<details>
<summary><h2>✨ Fitur Utama</h2></summary>

#### 🛒 **Manajemen Transaksi & Kasir**
- Antarmuka kasir intuitif
- Keranjang dinamis
- Dukungan berbagai metode pembayaran (tunai, kartu, QRIS)
- Manajemen shift
- Tahan & lanjutkan transaksi
- Struk digital & cetak
- Mode offline

#### 📦 **Manajemen Inventaris**
- Daftar produk & varian
- Manajemen stok *real-time*
- Manajemen resep
- Penyesuaian stok
- Manajemen pemasok
- Purchase order
- Manajemen bahan baku

#### 📊 **Analitik & Pelaporan**
- Dasbor komprehensif
- Grafik kinerja
- Analisis profitabilitas
- Laporan kinerja kasir
- Ekspor data (CSV)

#### 👥 **Manajemen Pengguna & Pelanggan**
- Manajemen pengguna & role
- Manajemen pelanggan
- Sistem poin loyalitas
- Penukaran hadiah

#### ⚙️ **Pengaturan & Kustomisasi**
- Profil bisnis
- Pengaturan struk
- Konfigurasi email
- Manajemen promosi

</details>

---

<details>
<summary><h2>🚀 Tumpukan Teknologi (Tech Stack)</h2></summary>

#### **Frontend**
- React.js `^18.3.1`
- Vite `^5.4.8`
- Styled Components `^6.1.13`
- React Router DOM `^6.27.0`
- React Context API & useReducer
- Axios `^1.7.7`
- Recharts `^2.13.0`
- Dexie.js `^4.2.0`
- React Toastify `^11.0.5`
- Framer Motion `^12.23.12`

#### **Backend**
- Node.js
- Express.js `^4.19.2`
- MySQL2 `^3.10.0`
- JWT `^9.0.2`
- Bcrypt
- express-rate-limit
- express-validator `^7.1.0`
- Multer `^2.0.2`
- Nodemailer `^6.9.14`

</details>

---

<details>
<summary><h2>🗺️ Struktur Proyek</h2></summary>

```

smart-pos/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   ├── services/
│   │   └── stockService.js
│   ├── utils/
│   ├── index.js
│   ├── .env
│   └── package.json
└── frontend/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js
└── package.json

````

</details>

---

## 🛠️ Instalasi & Setup Lokal

### **Prasyarat**
- Node.js (v18+)
- npm
- MySQL/MariaDB

### **Memulai**
```bash
git clone https://github.com/ifauzeee/Smart-POS.git
cd Smart-POS
````

### **1. Backend Setup**

```bash
cd backend
npm install
```

* Buat database `smart_pos_db`
* Import `backend/database/schema.sql`
* Copy `example.env` ke `.env` dan sesuaikan

```bash
cp example.env .env
```

* Jalankan server:

```bash
npm start
```

Backend jalan di `http://localhost:5000`

### **2. Frontend Setup**

```bash
cd ../frontend
npm install
npm run dev
```

Frontend jalan di `http://localhost:5173`

---

## 🔑 Variabel Lingkungan (.env)

| Variabel                 | Contoh                                              | Deskripsi                          |
| ------------------------ | --------------------------------------------------- | ---------------------------------- |
| DB\_HOST                 | localhost                                           | Host server database               |
| DB\_USER                 | root                                                | Nama pengguna database             |
| DB\_PASSWORD             |                                                     | Password database                  |
| DB\_NAME                 | smart\_pos\_db                                      | Nama database                      |
| JWT\_SECRET              | string\_acak\_sangat\_panjang                       | Kunci JWT (**wajib diganti**)      |
| ENCRYPTION\_KEY          | string\_acak\_32\_karakter                          | Kunci enkripsi (**wajib diganti**) |
| ADMIN\_REGISTRATION\_KEY | frasa\_rahasia\_anda                                | Untuk registrasi admin pertama     |
| FRONTEND\_URL            | [http://localhost:5173](http://localhost:5173)      | URL frontend (CORS)                |
| EMAIL\_USER              | [email.anda@gmail.com](mailto:email.anda@gmail.com) | Email pengirim struk               |
| EMAIL\_PASS              | sandi\_aplikasi\_16\_digit                          | Sandi aplikasi Gmail               |

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah **Lisensi ISC**.