<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LicenseKeyController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // User management routes
    Route::apiResource('users', UserController::class);

    // Store management routes
    Route::apiResource('stores', StoreController::class);

    // Category routes
    Route::apiResource('categories', CategoryController::class);

    // Product routes
    Route::apiResource('products', ProductController::class);

    // Shift routes
    Route::get('/shifts/active', [\App\Http\Controllers\Api\ShiftController::class, 'active']);
    Route::post('/shifts/{id}/close', [\App\Http\Controllers\Api\ShiftController::class, 'close']);
    Route::apiResource('shifts', \App\Http\Controllers\Api\ShiftController::class);

    // Shift Request routes 
    Route::post('/shift-requests/{id}/approve', [\App\Http\Controllers\Api\ShiftRequestController::class, 'approve']);
    Route::post('/shift-requests/{id}/reject', [\App\Http\Controllers\Api\ShiftRequestController::class, 'reject']);
    Route::apiResource('shift-requests', \App\Http\Controllers\Api\ShiftRequestController::class);

    // Transaction routes
    Route::apiResource('transactions', \App\Http\Controllers\Api\TransactionController::class);

    // Coupon routes
    Route::post('/coupons/check', [\App\Http\Controllers\Api\CouponController::class, 'check']);
    Route::apiResource('coupons', \App\Http\Controllers\Api\CouponController::class);

    // Promotion routes (bundle, minimum_purchase, buy_x_get_y)
    Route::apiResource('promotions', \App\Http\Controllers\Api\PromotionController::class);

    // License key routes
    Route::post('/license-keys/activate', [LicenseKeyController::class, 'activate']);
    Route::apiResource('license-keys', LicenseKeyController::class);
});
