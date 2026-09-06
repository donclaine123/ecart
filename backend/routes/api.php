<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes (/api/v1/...)
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', [HealthController::class, 'check']);

// Public Catalog Endpoints
Route::get('/categories', [ProductController::class, 'categories']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/featured-products', [ProductController::class, 'featured']);

// Public Auth Endpoints (throttled)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Protected Customer Routes (Stateless Sanctum Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth Profile & Logout
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Shopping Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::patch('/cart/items/{id}', [CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Orders & Atomic Checkout
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
});

// Admin Portal Routes (Guarded by Sanctum + role:admin)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard/stats', [OrderController::class, 'adminStats']);
    Route::get('/products', [ProductController::class, 'adminIndex']);
    Route::post('/products', [ProductController::class, 'adminStore']);
    Route::put('/products/{id}', [ProductController::class, 'adminUpdate']);
    Route::delete('/products/{id}', [ProductController::class, 'adminDestroy']);
    Route::get('/orders', [OrderController::class, 'adminOrders']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});
