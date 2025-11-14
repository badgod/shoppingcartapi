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
```


### 2. Install Dependencies
```bash
npm install
````

### 3\. Environment Setup (.env)

Create a `.env` file in the root of the project (at the same level as `package.json`) and add the following variables:

```ini
# Database Connection
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=3306
DB_DATABASE=shoppingcart_db

# JWT Secret
JWT_SECRET=your_super_strong_secret_key_here

# Server Environment
PORT=3000
ENV=development
```

*(**Important:** `DB_DATABASE` must match the database name you create in MySQL, and `JWT_SECRET` should be a random, complex string.)*

### 4\. Database Setup

Before running the app, you must set up the database and tables.

1.  **Create Database:** In your MySQL client (e.g., phpMyAdmin, Sequel Pro, DBeaver), create a new, empty database (e.g., `shoppingcart_db` to match your `.env`).

2.  **Run Migrations:** (This creates all the tables)

    ```bash
    npm run knex:migrate:latest
    ```

3.  **Run Seeds:** (This populates the database with initial data like the Admin user, categories, and products)

    ```bash
    npm run knex:seed:run
    ```

### 5\. Run the Project

```bash
npm start
```

Your server is now running on `http://localhost:3000`.

-----

## 📚 API Documentation (Swagger)

This API is fully documented using Swagger UI.

  * **URL:** **[http://localhost:3000/api-docs](https://www.google.com/search?q=http://localhost:3000/api-docs)**

You can test all API endpoints directly from this page.
*(**How to use:** Login via `POST /api/auth/login` -\> copy the `token` -\> click the green "Authorize" button at the top right -\> paste `Bearer <your_token>` -\> click "Authorize".)*

-----

## 🗺️ API Endpoints Overview

Base URL: `/api`

### Auth (`/api/auth`)

  * `POST /register`: Register a new customer account.
  * `POST /login`: Log in (as Customer or Admin).

### Profile (`/api/profile`)

  * `(Token)` `GET /me`: Get my user profile.
  * `(Token)` `PUT /me`: Update my user profile.
  * `(Token)` `PUT /change-password`: Change my password.

### Users (`/api/users`)

  * `(Admin)` `GET /`: Get all users.
  * `(Admin)` `GET /:id`: Get user by ID.
  * `(Admin)` `PUT /:id`: Update user (can change role).
  * `(Admin)` `DELETE /:id`: Delete user.

### Products (`/api/products`)

  * `(Token)` `GET /`: Get all products.
  * `(Token)` `GET /:productId`: Get product by ID.
  * `(Admin)` `POST /`: Create new product (multipart/form-data).
  * `(Admin)` `PUT /:productId`: Update product (multipart/form-data).
  * `(Admin)` `DELETE /:productId`: Delete product.

### Categories (`/api/categories`)

  * `(Token)` `GET /`: Get all categories.
  * `(Admin)` `POST /`: Create new category.
  * `(Token)` `GET /:id`: Get category by ID.
  * `(Admin)` `PUT /:id`: Update category.
  * `(Admin)` `DELETE /:id`: Delete category.

### Statuses (`/api/statuses`)

  * `(Token)` `GET /`: Get all product statuses.
  * `(Admin)` `POST /`: Create new status.
  * `(Token)` `GET /:id`: Get status by ID.
  * `(Admin)` `PUT /:id`: Update status.
  * `(Admin)` `DELETE /:id`: Delete status.

### Orders (`/api/orders`)

  * `(Customer)` `POST /`: Create new order (Checkout).
  * `(Customer)` `GET /my`: Get my order history.
  * `(Admin)` `GET /`: Get all orders in the system.
  * `(Token)` `GET /:id`: Get order details (Admin=any, Customer=own).

<!-- end list -->


