<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SubcategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RazorpayController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\SystemController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [App\Http\Controllers\PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [App\Http\Controllers\PasswordResetController::class, 'resetPassword']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/subcategories', [SubcategoryController::class, 'index']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/trending', [ProductController::class, 'trending']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/coupons', [CouponController::class, 'index']);

// Export & Download routes
Route::middleware('admin.token')->prefix('admin')->group(function () {
    Route::get('/export/excel/{type}', [ExportController::class, 'exportExcel']);
    Route::get('/export/pdf/{type}', [ExportController::class, 'exportPdf']);
    Route::get('/system/backup/download/{filename}', [SystemController::class, 'downloadBackup']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::post('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Coupons Apply
    Route::post('/coupons/apply', [CouponController::class, 'apply']);

    // User order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}/track', [OrderController::class, 'track']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'downloadInvoice']);
    Route::post('/orders', [OrderController::class, 'store']);
    
    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{wishlist}', [WishlistController::class, 'destroy']);
    
    // Razorpay
    Route::post('/razorpay/order', [RazorpayController::class, 'createOrder']);
    Route::post('/razorpay/verify', [RazorpayController::class, 'verifyPayment']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);

        // System Management
        Route::prefix('system')->group(function () {
            Route::get('/logs', [SystemController::class, 'getLogs']);
            Route::get('/logs/{filename}', [SystemController::class, 'viewLog']);
            Route::delete('/logs/{filename}', [SystemController::class, 'deleteLog']);
            Route::post('/backup', [SystemController::class, 'backupDatabase']);
            Route::post('/cache/clear/{type}', [SystemController::class, 'clearCache']);
        });

        // Stock Management
        Route::get('/stock/low', [ProductController::class, 'lowStock']);
        Route::patch('/products/{product}/stock', [ProductController::class, 'updateStock']);

        // Categories & Subcategories
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::match(['put', 'post'], '/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        
        Route::get('/subcategories', [SubcategoryController::class, 'index']);
        Route::post('/subcategories', [SubcategoryController::class, 'store']);
        Route::delete('/subcategories/{subcategory}', [SubcategoryController::class, 'destroy']);

        // Brands
        Route::get('/brands', [BrandController::class, 'index']);
        Route::post('/brands', [BrandController::class, 'store']);
        Route::match(['put', 'post'], '/brands/{brand}', [BrandController::class, 'update']);
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);
        
        // Products
        Route::post('/products', [ProductController::class, 'store']);
        Route::match(['put', 'post'], '/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        
        // Orders
        Route::get('/all-orders', [OrderController::class, 'index']);
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);

        // Reviews
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::patch('/reviews/{review}/status', [ReviewController::class, 'updateStatus']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

        // Settings
        Route::post('/settings', [SettingController::class, 'update']);

        // Banners
        Route::get('/banners', [BannerController::class, 'index']);
        Route::post('/banners', [BannerController::class, 'store']);
        Route::match(['put', 'post'], '/banners/{banner}', [BannerController::class, 'update']);
        Route::delete('/banners/{banner}', [BannerController::class, 'destroy']);

        // Pages
        Route::get('/pages', [PageController::class, 'index']);
        Route::post('/pages', [PageController::class, 'store']);
        Route::match(['put', 'post'], '/pages/{page}', [PageController::class, 'update']);
        Route::delete('/pages/{page}', [PageController::class, 'destroy']);

        // Coupons CRUD
        Route::get('/coupons', [CouponController::class, 'index']);
        Route::post('/coupons', [CouponController::class, 'store']);
        Route::match(['put', 'post'], '/coupons/{coupon}', [CouponController::class, 'update']);
        Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy']);

        // Imports
        Route::post('/import/{type}', [ImportController::class, 'import']);
    });
});
