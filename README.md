# AuraStore - Premium MERN Stack E-Commerce Web Application

AuraStore is a modern, production-ready, full-stack E-Commerce platform built with a high-fidelity slate/indigo UI theme, robust JWT session controls, and full Admin capabilities. 

The application is structured to be completely **GitHub-ready**, containing isolated `frontend` and `backend` directories, dynamic Vite-proxied ports, and dedicated hosting configurations for Vercel (frontend) and Render/Node services (backend).

---

## 🚀 Features

### 🛍️ Customer Experience
- **Interactive Home Page**: Curved category banners and curated collections (Featured, Trending, New Arrivals).
- **Product Catalog Shop**: Search keywords, price filtering, category selectors, rating thresholds, and sorting parameters.
- **Detailed Product Sheets**: Thumbnail carousels, stock alerts, user reviews list, review submission forms, and related items.
- **Customer Wishlist & Cart**: LocalStorage state management for guest checkouts merging seamlessly to MongoDB on logins.
- **Promo Coupon Checks**: Support for discount coupon code validations (e.g. `WELCOME20`, `SAVE10`).
- **Secure Checkout & Invoices**: Shipping address validations, Card/COD payment selection, mock card portals, and delivery tracking.
- **Profile & Security**: Update profile details, change security passwords, and handle forgot/reset password tokens via server logs.

### 🛡️ Admin Dashboard Console
- **Analytics Metrics**: Real-time sales calculations, customer sign-ups, inventory totals, and sales history charts.
- **Low Stock Feeds**: Real-time listing alerts for products with stock levels `<= 5`.
- **Product CRUD**: Add, edit, upload images (via Multer), toggle promotion flags, and delete catalog listings.
- **Category CRUD**: Update category parameters (slugs generated automatically) with active product referential protection.
- **Order Tracking**: Review orders, payment updates, and modify shipping status dropdowns (Pending, Processing, Shipped, Delivered, Cancelled).
- **User Audits**: Review users list, toggle user roles between Customer and Administrator, and delete accounts.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router DOM v6, Tailwind CSS v4, Axios, Lucide React, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose schemas
- **Authentication**: JSON Web Tokens (JWT) transmitted via HTTP-Only Secure Cookies, bcryptjs password hashing
- **File Uploads**: Multer
- **Package Manager**: npm

---

## 📂 Directory Layout

```
├── .gitignore
├── package.json (Root concurrent runner)
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── server.js
│   ├── config/db.js
│   ├── models/ (User, Product, Category, Order, Coupon)
│   ├── controllers/ (auth, products, categories, cart, wishlist, orders, coupons, users)
│   ├── routes/ (auth, products, categories, cart, wishlist, orders, coupons, users)
│   ├── middleware/ (auth, error, upload, mockDbMiddleware)
│   └── uploads/ (Category images)
└── frontend/
    ├── package.json
    ├── vercel.json (Vite SPA fallback rewrite)
    ├── vite.config.js (Vite + Tailwind v4 configs)
    ├── index.html
    └── src/
        ├── App.jsx (Router pathways)
        ├── main.jsx (Mounting root)
        ├── index.css (Tailwind styles)
        ├── utils/api.js (Axios base instance)
        ├── context/ (Auth, Cart, Wishlist Providers)
        ├── components/ (Navbar, Footer, ProductCard, Skeletons, AdminSidebar)
        └── pages/ (Storefront & Admin Views)
```

---

## 💻 Local Setup & Running Instructions

### Prerequisites
- Node.js installed (v18 or higher recommended)
- MongoDB Community Server (optional - the server runs in **Demo Mock Mode** if offline!)

### 1. Install Workspace Dependencies
Execute the following command in the project root directory. It will automatically trigger package installations in both subdirectories:
```bash
npm install
```

### 2. Configure Environment Variables
Copy the env template in the `backend/` folder and customize keys if connecting to an external MongoDB Atlas cluster:
```bash
# In backend/ directory
cp .env.example .env
```
Default local configurations:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=super_secret_jwt_encryption_key_for_production_1298471
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Database (When using MongoDB)
If you have MongoDB active locally or configured via the `.env` MONGO_URI, run this command from the root folder to seed sample products, categories, and test user accounts:
```bash
npm run seed
```

### 4. Run the Full-Stack Application
Start both the API backend and the React Vite development servers concurrently:
```bash
npm run dev
```

- **Frontend URL**: [http://localhost:5174/](http://localhost:5174/) (or [http://localhost:5173/](http://localhost:5173/) if available)
- **Backend API URL**: [http://localhost:5000/](http://localhost:5000/)

---

## 🎮 Resilient Database Fallback (Demo Mode)

If a connection to MongoDB cannot be established (e.g., service is stopped), the backend is designed to run in **Demo Mock Mode**:
- A console message will output: `[DEMO MODE] Mongoose database connection failed. Backend is running in local in-memory mock fallback mode!`
- The server will continue running on port `5000` without crashing.
- A full set of Categories and 30+ Products will be loaded from an in-memory mock dataset.
- Interactive sessions, catalog filtering, logins, cart checkouts, and stats updates will be fully functional and held in server-memory, making the storefront explore-ready.

---

## 🔑 Default Credentials (Mock & Live database)

Use these accounts to test credentials:

### 1. Administrator Account
- **Email**: `admin@example.com`
- **Password**: `password123`

### 2. Customer Account
- **Email**: `john@example.com`
- **Password**: `password123`

---

## 🌐 Production Hosting Deployment Guides

### Frontend (Vercel)
The React frontend is pre-packaged for Vercel:
1. Navigate to your Vercel Dashboard, click **Add New Project**, and link your GitHub repository.
2. Select the `frontend` folder as the **Root Directory** of the project.
3. Configure the build parameters:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: Set this to your deployed Backend API URL (e.g. `https://my-backend-app.onrender.com`).
5. Vercel will automatically compile the app, using the `vercel.json` rewrite file to ensure client routes don't return 404s.

### Backend (Render)
The Express backend is pre-packaged for Render:
1. Go to Render Dashboard, click **New +**, and select **Web Service**.
2. Link your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables in Render:
   - `PORT`: `5000` or let Render set it dynamically.
   - `MONGO_URI`: Your MongoDB Atlas clusters connection string.
   - `JWT_SECRET`: A secure key for signature encoding.
   - `FRONTEND_URL`: Your deployed Vercel frontend URL (for CORS allowance).
5. Click **Deploy Web Service**.
