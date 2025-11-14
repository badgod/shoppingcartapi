# 🛒 Shopping Cart API (Backend)

This is a complete backend API for a Shopping Cart project, built with Node.js, Express, TypeScript, and MySQL. It features JWT authentication, role-based access control, inventory management, and a full checkout order flow.

---

## ✨ Features

* **Authentication:** Full user registration and login using **JWT (JSON Web Tokens)**.
* **Role-Based Access Control:** Clear separation between `customer` and `admin` roles using custom middleware.
* **Profile Management:** Logged-in users can get their profile, update their profile, and change their password.
* **Admin Dashboard APIs:** Full CRUD operations for Admins to manage all system data:
    * Manage Users
    * Manage Products
    * Manage Categories
    * Manage Product Statuses
    * View All Orders
* **Order/Checkout Flow:** A robust ordering system:
    * Create Order (Checkout)
    * Create Order Items
    * Automatic **Stock Deduction**
    * Uses **Database Transactions** for data integrity (all or nothing).
* **File Uploads:** Supports product image uploads using `multer`.
* **Modern Architecture:** Uses `async/await` with `mysql2/promise` (Connection Pool) across the entire project.
* **Database Management:** Uses `Knex.js` for structured Migrations and Seeds.
* **API Documentation:** Automatically generated, interactive API documentation via **Swagger UI**.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** MySQL (using `mysql2/promise`)
* **Migrations/Seeds:** Knex.js
* **Authentication:** `jsonwebtoken` (JWT), `bcrypt`
* **File Uploads:** `multer`
* **Documentation:** `swagger-ui-express`
* **Utilities:** `nodemon`, `ts-node`, `dotenv`

---

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Clone the Project
```bash
git clone [https://github.com/badgod/shoppingcartapi.git](https://github.com/badgod/shoppingcartapi.git)
cd shoppingcartapi
