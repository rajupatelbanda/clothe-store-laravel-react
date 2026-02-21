# Implemented Functionalities & Technical Architecture

This document provides a comprehensive overview of the **Gemini Cloth Store** application, detailing the features implemented, the technical choices made, and the specific packages used to achieve a robust, modern e-commerce platform.

---

## 1. Backend Architecture (Laravel 12.x)

The backend serves as the core engine, handling data persistence, business logic, security, and API communication.

### **Core Features & Functionalities**

1.  **Authentication & Security (Sanctum):**
    *   **Feature:** Secure login, registration, and role-based access control (Admin vs. User).
    *   **Why:** To protect user data and ensure only authorized personnel can access the admin dashboard.
    *   **Package:** `laravel/sanctum` (v4.0)
    *   **Rationale:** Sanctum provides a lightweight, token-based authentication system perfect for SPAs (Single Page Applications) like React, handling API tokens without the complexity of OAuth2.

2.  **Product Management:**
    *   **Feature:** CRUD (Create, Read, Update, Delete) operations for products, categories, subcategories, brands, and variations (size/color).
    *   **Why:** To allow dynamic inventory management without code changes.
    *   **Technical Detail:** Uses Eloquent relationships (`hasMany`, `belongsTo`) to link products to their metadata efficiently.

3.  **Order Processing & Payments:**
    *   **Feature:** Complete checkout flow supporting **Razorpay** (online) and **Cash on Delivery (COD)**.
    *   **Why:** To offer flexible payment options suitable for the Indian market.
    *   **Packages:** `razorpay/razorpay` (v2.9)
    *   **Technical Detail:** Implements database transactions (`DB::beginTransaction`) to ensure orders and order items are saved atomically—preventing partial data corruption if a payment fails.

4.  **Review System with Moderation:**
    *   **Feature:** Users can review products; Admins must approve reviews before they go live.
    *   **Why:** To maintain quality content and prevent spam.
    *   **Technical Detail:** Added an `is_approved` boolean flag to the `reviews` table and a dedicated Admin API endpoint for toggling this status.

5.  **Dynamic Banners & Content:**
    *   **Feature:** Admin-controlled banners for Home, Shop, Cart, and Checkout pages.
    *   **Why:** To allow marketing campaigns (e.g., "Summer Sale") to be updated instantly without developer intervention.
    *   **Technical Detail:** Banners are stored with a `page` identifier, allowing the frontend to fetch specific visuals for specific routes.

6.  **System Health & Maintenance:**
    *   **Feature:** Database backups, log viewing, and cache clearing from the dashboard.
    *   **Why:** To allow non-technical admins to perform basic system maintenance and troubleshooting.
    *   **Technical Detail:** Uses Laravel's `Artisan` facade to run console commands via web requests.

7.  **PDF Invoicing:**
    *   **Feature:** Auto-generation of PDF invoices for orders.
    *   **Why:** To provide professional purchase proof for customers.
    *   **Package:** `barryvdh/laravel-dompdf` (v3.x)

---

## 2. Frontend Architecture (React 19.x)

The frontend delivers a high-performance, interactive user interface designed for engagement and conversion.

### **Core Features & Functionalities**

1.  **State Management (Context API):**
    *   **Feature:** Global management of Cart, Wishlist, and Authentication state.
    *   **Why:** To ensure that when a user adds an item to the cart, the navbar count updates instantly across *all* pages without page reloads.
    *   **Technical Detail:** `CartContext.jsx` handles complex logic like calculating subtotals, applying coupons, and persisting data to `localStorage`.

2.  **Advanced "Shop" Interface:**
    *   **Feature:** Multi-select filtering (Brands/Categories), Price Range Slider, and Search.
    *   **Why:** To help users find products quickly in a large catalog.
    *   **Technical Detail:** Uses URL parameters and React state to fetch filtered data dynamically from the backend API.

3.  **Interactive Product Details:**
    *   **Feature:** Image gallery with zoom, variation selection (Color/Size), and related products.
    *   **Why:** To mimic the in-store experience of examining a product closely.
    *   **Technical Detail:** Implemented using `swiper` for touch-friendly carousels and custom CSS for hover zoom effects.

4.  **Optimized Checkout Flow:**
    *   **Feature:** Multi-step checkout with address validation and dynamic payment method selection (Online vs. COD).
    *   **Why:** Reducing friction at checkout increases conversion rates.
    *   **Technical Detail:** Integrates the Razorpay script dynamically and handles success/failure callbacks to update the order status in real-time.

5.  **Responsive "Admin Minimalist" Dashboard:**
    *   **Feature:** A dedicated, secure area for store management with a custom pink/white theme.
    *   **Why:** To provide a pleasant, efficient workspace for store owners.
    *   **Technical Detail:** Uses `AdminLayout.jsx` to wrap protected routes, ensuring consistent navigation and branding (Sidebar, Header).

---

## 3. Key Packages & Versions

### **Backend (Composer)**
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `laravel/framework` | ^12.0 | The foundation of the application. |
| `laravel/sanctum` | ^4.0 | API Token Authentication. |
| `razorpay/razorpay` | ^2.9 | Payment Gateway integration. |
| `barryvdh/laravel-dompdf` | ^3.1 | PDF Invoice generation. |
| `maatwebsite/excel` | ^3.1 | Exporting data (Orders/Products) to Excel. |

### **Frontend (NPM)**
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | ^19.2 | Core UI library. |
| `react-router-dom` | ^7.13 | Client-side routing (SPAs). |
| `axios` | ^1.13 | HTTP requests to the backend API. |
| `react-hook-form` | ^7.71 | Efficient form handling and validation. |
| `react-hot-toast` | ^2.6 | Beautiful, non-blocking notification popups. |
| `swiper` | ^12.1 | Touch-enabled sliders for banners and products. |
| `bootstrap` | ^5.3 | Responsive grid system and utility classes. |

---

## 4. Setup & Deployment Steps

1.  **Database:** Ensure MySQL/SQLite is running and `.env` is configured.
2.  **Migrations:** Run `php artisan migrate --seed` to create tables and populate initial data.
3.  **Storage:** Run `php artisan storage:link` to enable image serving.
4.  **Frontend:** Run `npm install` and `npm run dev` to start the Vite server.
5.  **Backend:** Run `php artisan serve` to expose the API.

---

**Developed with precision for a seamless E-Commerce experience.**
