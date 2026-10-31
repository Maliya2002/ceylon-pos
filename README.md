# 🍛 Ceylon Flavors - Sri Lankan Restaurant POS System

A high-performance, touch-optimized Point of Sale (POS), Kitchen Display (KDS), and Table Management system designed specifically for Sri Lankan food outlets, hot food shops, and restaurants (Rice & Curry, Kottu, Short Eats, Beverages).

Built with **React (Vite) + Tailwind CSS**, **Node.js (Express)**, and **Neon Serverless PostgreSQL (Prisma ORM)**.

---

## 🚀 Key Features

* **🍽️ Dual Ordering Modes:**
  * **Takeaway / Parcel:** Fast checkout, instant 80mm receipt generation, upfront payment collection.
  * **Dine-In:** Dining table assignment, modifier notes (e.g., *Less Spicy*, *Extra Gravy*, *Extra Cheese*), KOT slip printing, active bill accrual, and checkout table freeing.
* **⚡ Live Kitchen Display System (KDS):** Real-time order pipeline with status updates (`PENDING` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`).
* **🪑 Visual Table Floor Plan:** 8 Dining tables (T-01 to T-08) with capacity indicators, occupancy badges, and one-click billing.
* **🧾 80mm ESC/POS Thermal Printing:**
  * Clean **Customer Sales Receipt** with subtotal, discount, service charge, grand total, payment method, tendered amount, change due, and greeting.
  * Dedicated **Kitchen Order Ticket (KOT)** with portions and preparation notes.
* **📊 Daily Analytics & End-of-Day Z-Report:**
  * Total revenue and order counts.
  * Payment method reconciliation: **Cash in Drawer**, **Card**, **LankaQR**, and **Split**.
  * Best-selling Sri Lankan dishes ranking.
  * Printable **Official End-of-Day Z-Report** for cashier drawer closing.

---

## 🧑‍🍳 Default User Accounts

The system includes pre-configured roles with instant switching:

| Persona | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Kasun Bandara (Admin)** | `admin` | `admin123` | Full Access (POS, KDS, Tables, Reports, Management) |
| **Nuwan Perera (Cashier)** | `cashier` | `cashier123` | POS Terminal, Tables, Billing & Checkout, Receipts |
| **Chef Kamal (Kitchen)** | `kitchen` | `kitchen123` | Kitchen Display System (KDS) & KOT |

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Node.js, Express.js REST API, JWT Authentication
* **Database:** Neon PostgreSQL with Prisma ORM (with automatic built-in store fallback for instant zero-config testing)
* **Printing:** 80mm / 58mm ESC/POS layout styles with `@media print`

---

## 📦 Quickstart Guide

### 1. Install All Dependencies
Run from the root directory:
```bash
npm run install:all
```

Or individually:
```bash
# In server folder:
cd server && npm install

# In client folder:
cd client && npm install
```

### 2. Start Both Backend & Frontend
From the root directory, simply run:
```bash
npm run dev
```

* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`

---

## 🐘 Connecting to Neon PostgreSQL

1. Create a project at [Neon.tech](https://neon.tech).
2. Copy your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
3. Open `server/.env` and paste your connection string.
4. Push the schema to your Neon database:
   ```bash
   cd server
   npx prisma db push
   ```
5. Seed authentic Sri Lankan dishes and tables:
   ```bash
   npm run prisma:seed
   ```

*Note: If no Neon connection string is provided, the system automatically uses its built-in local store so you can test every single feature immediately with zero external configuration!*
