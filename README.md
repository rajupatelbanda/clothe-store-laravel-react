# Gemini Cloth Store - Premium E-Commerce Solution

A modern, full-stack e-commerce application built with **Laravel 12 (Backend)** and **React 19 (Frontend)**. This project features a robust admin dashboard, dynamic content management, and a seamless shopping experience tailored for the Indian market with Razorpay and COD support.

## 🚀 Key Features

*   **Advanced Storefront:** Multi-select filtering, dynamic search, and "Advanced Minimalist" UI design.
*   **Secure Checkout:** Integrated **Razorpay** payment gateway and **Cash on Delivery (COD)** support.
*   **Admin Dashboard:** Comprehensive management for Products, Orders, Banners, Coupons, and System Health.
*   **User Accounts:** Profile management, order tracking, and wishlist functionality.
*   **Dynamic Content:** Admin-controlled banners for every page (Home, Shop, Cart, etc.).
*   **Review System:** Moderated product reviews ensuring quality feedback.

## 🛠️ Tech Stack

*   **Backend:** Laravel 12, MySQL/SQLite, Sanctum (Auth)
*   **Frontend:** React 19, Vite, Bootstrap 5, Context API
*   **Payment:** Razorpay
*   **Tools:** DomPDF (Invoicing), Excel (Exports)

## 📦 Installation Guide

### Prerequisites
*   PHP >= 8.2
*   Composer
*   Node.js & NPM

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Configure your database in .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Ensure VITE_API_URL points to your backend (e.g., http://localhost:8000/api)
npm install
npm run dev
```

## 📖 Documentation
For a deep dive into the implemented features, packages used, and architectural decisions, please refer to the [Implemented Functionalities](implementedfunctionalities.md) document.

## 🤝 Contribution
1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/NewFeature`)
3.  Commit your changes
4.  Push to the branch
5.  Open a Pull Request

---
**Built by [Raju Patel]**
