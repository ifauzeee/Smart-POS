<p align="center">
  <img src="https://i.postimg.cc/Dwq1t64G/image.png" alt="Smart POS Logo" width="500"/>
</p>

<h1 align="center">Smart POS - Modern Point of Sale System</h1>

<p align="center">
  A modern, web-based POS (Point of Sale) application to manage transactions, inventory, and customers with advanced analytics and offline capabilities.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Express-4-green?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/MySQL-Database-orange?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Vite-5-purple?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-ISC-yellow" alt="License">
</p>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Prerequisites](#2-prerequisites)
  - [3. Database Setup](#3-database-setup)
  - [4. Backend Setup](#4-backend-setup)
  - [5. Frontend Setup](#5-frontend-setup)
- [⚙️ Environment Variables](#️-environment-variables)
- [📝 License](#-license)

---

## ✨ Features

- 💳 **POS System** – Fast and user-friendly interface for transactions.  
- 📦 **Product & Inventory Management** – Variants, recipes, stock tracking, purchase orders, stock adjustments.  
- 👥 **Customer & Loyalty Program** – Customer database and points-based loyalty.  
- 📊 **Analytics Dashboard** – Revenue, profit, top-selling products, cashier performance.  
- 🔑 **User & Role Management** – Access control with permissions.  
- 🔒 **Secure Authentication** – JWT, bcrypt, encryption.  
- 🌐 **Offline-First & PWA** – Can work without internet, auto-syncs later.  
- 📑 **Reports & Export** – Export data to CSV.  

---

## 🛠 Tech Stack

**Frontend:**
- React 18 + Vite  
- Styled Components, React Router DOM, Axios  
- Recharts (charts), Dexie.js (offline DB), Framer Motion (animation)  

**Backend:**
- Node.js + Express  
- MySQL / MariaDB (`mysql2`)  
- JWT (auth), bcrypt (password hashing), crypto (encryption)  
- Nodemailer (email), Multer (file upload)  

---

## 🚀 Getting Started

Ikuti langkah-langkah berikut untuk menjalankan project di lokal:

### 1. Clone Repository

```bash
git clone https://github.com/ifauzeee/Smart-POS.git
cd Smart-POS
```

### 2. Prerequisites

- Node.js 18+  
- npm (tersedia otomatis dengan Node.js)  
- MySQL / MariaDB  

### 3. Database Setup

1. Buat database baru dengan nama `smart_pos_db`.  
2. Jalankan **SQL schema** yang ada di folder `database/` atau file `schema.sql`.  

### 4. Backend Setup

```bash
cd backend
npm install
cp example.env .env
npm start
```

Server berjalan di `http://localhost:5000`.

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

---

## ⚙️ Environment Variables

Buat file `.env` di folder `backend` dengan isi seperti berikut:

| Variable        | Deskripsi                               | Contoh                  |
|-----------------|------------------------------------------|-------------------------|
| DB_HOST         | Host database                           | `localhost`             |
| DB_USER         | Username database                       | `root`                  |
| DB_PASSWORD     | Password database                       | `password123`           |
| DB_NAME         | Nama database                           | `smart_pos_db`          |
| DB_TIMEZONE     | Zona waktu database                     | `Asia/Jakarta`          |
| JWT_SECRET      | Secret untuk JWT                        | `your_jwt_secret_key`   |
| ENCRYPTION_KEY  | Key 32 karakter untuk enkripsi          | `32_character_secretkey`|
| FRONTEND_URL    | URL frontend                            | `http://localhost:5173` |
| EMAIL_USER      | Email bisnis (untuk kirim receipt)      | `yourmail@gmail.com`    |
| EMAIL_PASS      | App password Gmail (16 digit)           | `abcd efgh ijkl mnop`   |

---

## 📝 License

This project is licensed under the **ISC License**.  
See the [LICENSE](LICENSE) file for details.