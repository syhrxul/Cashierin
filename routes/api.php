<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LicenseKeyController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;

// =============================================
// PUBLIC ROUTES (Anti-Spam Login/Register)
// =============================================
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register/invite', [AuthController::class, 'registerByInvite']);
    Route::post('/login', [AuthController::class, 'login']);
});

// =============================================
// AUTHENTICATED (Rate Limited)
// =============================================
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/approval-status', [AuthController::class, 'approvalStatus']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // License key routes
    Route::post('/license-keys/activate', [LicenseKeyController::class, 'activate']);
    Route::get('/license-keys/store-status', [LicenseKeyController::class, 'storeStatus']);
});

// =============================================
// SUPER ADMIN ROUTES
// =============================================
Route::middleware(['auth:sanctum', 'superadmin', 'throttle:api'])->prefix('superadmin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Api\SuperAdminController::class, 'dashboard']);
    // User management
    Route::get('/users', [\App\Http\Controllers\Api\SuperAdminController::class, 'listUsers']);
    Route::get('/users/pending', [\App\Http\Controllers\Api\SuperAdminController::class, 'pendingUsers']);
    Route::post('/users', [\App\Http\Controllers\Api\SuperAdminController::class, 'createUser']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\SuperAdminController::class, 'deleteUser']);
    Route::post('/users/{id}/approve', [\App\Http\Controllers\Api\SuperAdminController::class, 'approveUser']);
    Route::post('/users/{id}/reject', [\App\Http\Controllers\Api\SuperAdminController::class, 'rejectUser']);
    Route::post('/users/{id}/change-password', [\App\Http\Controllers\Api\SuperAdminController::class, 'changePassword']);
    Route::get('/users/{id}/toggle-status', [\App\Http\Controllers\Api\SuperAdminController::class, 'toggleUserStatus']);
    Route::get('/activity-logs', [\App\Http\Controllers\Api\SuperAdminController::class, 'logs']);
    Route::get('/pulse-stats', [\App\Http\Controllers\Api\SuperAdminController::class, 'pulseStats']);

    // License keys
    Route::post('/license-keys', [LicenseKeyController::class, 'store']);
    Route::apiResource('license-keys', LicenseKeyController::class)->except(['store']);

    // Store management
    Route::apiResource('stores', StoreController::class)->names('superadmin.stores');
});

// Routes that only require approval but not yet a store (initial setup)
Route::middleware(['auth:sanctum', 'approved', 'throttle:api'])->group(function() {
    Route::post('/stores', [StoreController::class, 'store']);
});

// =============================================
// STORE-SCOPED ROUTES
// =============================================
Route::middleware(['auth:sanctum', 'store.access', 'store.license', 'throttle:api'])->group(function () {
    // Store management
    Route::get('/store/invite-code', [StoreController::class, 'inviteCode']);
    Route::post('/store/regenerate-invite-code', [StoreController::class, 'regenerateInviteCode']);
    Route::apiResource('stores', StoreController::class)->except(['store']);

    // User management (per toko)
    Route::get('/users/pending-approvals', [UserController::class, 'pendingApprovals']);
    Route::post('/users/{id}/approve', [UserController::class, 'approveUser']);
    Route::post('/users/{id}/reject', [UserController::class, 'rejectUser']);
    Route::post('/users/{id}/change-password', [UserController::class, 'changePassword']);
    Route::apiResource('users', UserController::class);

    // Category routes
    Route::apiResource('categories', CategoryController::class);

    // Product routes
    Route::apiResource('products', ProductController::class);

    // Shift routes
    Route::get('/shifts/active', [\App\Http\Controllers\Api\ShiftController::class, 'active']);
    Route::post('/shifts/{id}/close', [\App\Http\Controllers\Api\ShiftController::class, 'close']);
    Route::apiResource('shifts', \App\Http\Controllers\Api\ShiftController::class);

    // Shift Schedule routes
    Route::apiResource('shift-schedules', \App\Http\Controllers\Api\ShiftScheduleController::class);

    // Shift Request routes
    Route::post('/shift-requests/{id}/approve', [\App\Http\Controllers\Api\ShiftRequestController::class, 'approve']);
    Route::post('/shift-requests/{id}/reject', [\App\Http\Controllers\Api\ShiftRequestController::class, 'reject']);
    Route::apiResource('shift-requests', \App\Http\Controllers\Api\ShiftRequestController::class);

    // Transaction routes
    Route::apiResource('transactions', \App\Http\Controllers\Api\TransactionController::class);

    // Coupon routes
    Route::post('/coupons/check', [\App\Http\Controllers\Api\CouponController::class, 'check']);
    Route::apiResource('coupons', \App\Http\Controllers\Api\CouponController::class);

    // Promotion routes
    Route::apiResource('promotions', \App\Http\Controllers\Api\PromotionController::class);
});
