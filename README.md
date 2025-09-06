<p align="center">
  <img src="https://i.pinimg.com/474x/6c/1a/e3/6c1ae3e1c0f7985bb55e74cc9963c822.jpg" alt="Smart POS Logo" width="150"/>
</p>

<h1 align="center">Smart POS - Modern Point of Sale System</h1>

<p align="center">
  A comprehensive, modern, web-based Point of Sale (POS) application designed to streamline business operations. It features real-time transaction processing, advanced inventory management, customer loyalty programs, and in-depth analytics, complete with offline capabilities to ensure business continuity.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=nodedotjs" alt="Node.js/Express">
  <img src="https://img.shields.io/badge/Database-MySQL-orange?logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Vite-5.4-purple?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-ISC-yellow" alt="License">
</p>

---

## Table of Contents

-   [✨ Key Features](#-key-features)
-   [🛠️ Tech Stack](#️-tech-stack)
-   [🚀 Getting Started](#-getting-started)
    -   [Prerequisites](#1-prerequisites)
    -   [Database Setup](#2-database-setup)
    -   [Backend Setup](#3-backend-setup)
    -   [Frontend Setup](#4-frontend-setup)
-   [⚙️ Environment Configuration (`.env`)](#️-environment-configuration-env)
-   [📝 License](#-license)

---

## ✨ Key Features

[cite_start]A comprehensive suite of tools to manage and grow your business[cite: 161]:
* **Intuitive POS System:** A fast and user-friendly interface for processing sales transactions.
* **Advanced Product Management:** Manage products with support for variants (e.g., size, color) and recipes linked to raw materials.
* **Robust Inventory Control:**
    * Real-time stock tracking.
    * Receive stock from suppliers via Purchase Orders.
    * Manual stock adjustments for cycle counts, damages, or returns.
* **Purchase Order Management:** Create and manage purchase orders to suppliers.
* **Customer Relationship & Loyalty:** Maintain a customer database and manage a points-based loyalty program.
* **Analytics Dashboard:** Gain insights with metrics on revenue, profit, top-selling products, and cashier performance.
* **User & Role Management:** A flexible role and permission system to control user access.
* **Operational Management:** Track expenses, manage cashier shifts, and create powerful promotions.
* **Offline-First Capability:** Continue making sales even when the internet is down; data syncs automatically upon reconnection.
* **Progressive Web App (PWA):** Installable on desktop devices for a native app-like experience.
* **CSV Data Export:** Export transaction history and other reports for further analysis.

---

## 🛠️ Tech Stack

This project is built with a modern, reliable, and scalable technology stack.

* **Frontend:**
    * [cite_start]**Framework:** React 18 [cite: 1]
    * [cite_start]**Build Tool:** Vite [cite: 2]
    * [cite_start]**Styling:** Styled Components [cite: 1]
    * **State Management:** React Context API
    * [cite_start]**Routing:** React Router DOM [cite: 1]
    * [cite_start]**HTTP Client:** Axios [cite: 1]
    * [cite_start]**Charts & Graphs:** Recharts [cite: 1]
    * **Offline Database:** Dexie.js (IndexedDB Wrapper)
    * **Animation:** Framer Motion

* **Backend:**
    * [cite_start]**Framework:** Node.js & Express.js [cite: 163]
    * [cite_start]**Database:** MySQL / MariaDB (using `mysql2`) [cite: 163]
    * [cite_start]**Authentication:** JSON Web Tokens (JWT) [cite: 163]
    * [cite_start]**Security:** `bcrypt` for password hashing, `crypto` for secure data encryption [cite: 163]
    * [cite_start]**Services:** `Nodemailer` for email receipts, `Multer` for file uploads [cite: 163, 164]

---

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites

Ensure you have the following software installed:
* **Node.js:** Version 18.x or higher.
* **npm:** Included with Node.js.
* **Database Server:** A running instance of MySQL or MariaDB.

### 2. Database Setup

1.  Create a new database in your MySQL/MariaDB server. The recommended name is `smart_pos_db`.
2.  Execute the following SQL script to create all the necessary tables and relationships.

<details>
<summary><strong>Click to view the full SQL Schema</strong></summary>

```sql
CREATE TABLE `businesses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(255) DEFAULT 'My Store',
  `address` text DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `payment_methods` json DEFAULT '["Tunai", "Kartu", "QRIS"]',
  `receipt_logo_url` varchar(255) DEFAULT NULL,
  `receipt_footer_text` varchar(255) DEFAULT 'Thank you for your purchase!',
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

-- Additional tables for logging, shifts, etc. can be added here as needed.
````

\</details\>

### 3\. Backend Setup

1.  **Navigate to the Backend Directory:**

    ```bash
    cd backend
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment:**

      * Create a `.env` file by copying the example file.
        ```bash
        cp example.env .env
        ```
      * Open the newly created `.env` file and fill in all the required variables according to your local setup. See the **Environment Configuration** section below for details.

4.  **Run the Backend Server:**

    ```bash
    npm start
    ```

    The server will start, typically on `http://localhost:5000`.

### 4\. Frontend Setup

1.  **Navigate to the Frontend Directory:**
    ```bash
    cd frontend
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`. It is pre-configured to communicate with the backend running on port 5000.

-----

## ⚙️ Environment Configuration (`.env`)

The `.env` file in the `backend` directory is crucial for the application's configuration. **Never commit this file to your Git repository.**

| Variable                 | Description                                                                                                                                                             | Example Value                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `DB_HOST`                | [cite\_start]The hostname of your database server. [cite: 159]                                                                                                                       | `localhost`                                  |
| `DB_USER`                | [cite\_start]The username for your database connection. [cite: 159]                                                                                                                | `root`                                       |
| `DB_PASSWORD`            | The password for the database user. [cite\_start]Leave blank if there is no password. [cite: 159]                                                                                      | `your_secret_password`                       |
| `DB_NAME`                | [cite\_start]The name of the database you created in Step 2. [cite: 159]                                                                                                               | `smart_pos_db`                               |
| `DB_TIMEZONE`            | The timezone used by the database server.                                                                                                                               | `Asia/Jakarta`                               |
| `JWT_SECRET`             | A long, random, and secret key used to sign authentication tokens (JWT). [cite\_start]**Must be a unique value.** [cite: 159]                                                         | `a_very_long_and_secure_random_string`       |
| `ENCRYPTION_KEY`         | A secret key that is **exactly 32 characters long**, used for encrypting sensitive data like email passwords. [cite\_start]**Must be a unique value.** [cite: 159]                 | `a_32_character_long_encryption_key`       |
| `ADMIN_REGISTRATION_KEY` | A secret code required **only for the very first admin registration**. [cite\_start]Change this to something hard to guess. [cite: 159]                                             | `"secret_phrase_for_first_admin"`          |
| `FRONTEND_URL`           | The full URL of your frontend application. [cite\_start]This is essential for the CORS policy. [cite: 159]                                                                             | `http://localhost:5173`                      |
| `EMAIL_USER`             | [cite\_start]The Gmail address that will be used to send email receipts. [cite: 159, 160]                                                                                                | `your.business.email@gmail.com`              |
| `EMAIL_PASS`             | [cite\_start]The **16-digit App Password** generated from your Google account, not your regular login password. [cite: 159, 160]                                                              | `abcd efgh ijkl mnop`                        |

-----

## 📝 License

[cite\_start]This project is licensed under the ISC License. [cite: 1, 303]