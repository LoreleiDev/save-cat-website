<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ForgotPasswordController;

use App\Http\Controllers\ReportController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;

// Public routes (tidak perlu token)
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/verify-email', [RegisterController::class, 'verifyEmail']);
Route::post('/resend-verification', [RegisterController::class, 'resendVerificationCode']);
Route::post('/login', [LoginController::class, 'login']);

// Reports public routes
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{id}', [ReportController::class, 'show']);

// Forgot Password routes
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetCode']);
Route::post('/verify-reset-code', [ForgotPasswordController::class, 'verifyResetCode']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
Route::post('/resend-reset-code', [ForgotPasswordController::class, 'resendResetCode']);

// Protected routes (butuh token)
Route::middleware('auth.user_token')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/user', [LoginController::class, 'user']);
    
    // Reports & Comments authenticated routes
    Route::post('/reports', [ReportController::class, 'store']);
    Route::post('/reports/{id}/comments', [CommentController::class, 'store']);

    Route::prefix('dashboard')->group(function () {
        Route::get('/overview', [DashboardController::class, 'overview']);
        Route::get('/users', [DashboardController::class, 'users']);
        Route::get('/users/{id}', [DashboardController::class, 'userDetails']);
        Route::post('/users/{id}/force-logout', [DashboardController::class, 'forceLogout']);
        
        Route::get('/reports', [DashboardController::class, 'reports']);
        Route::post('/reports/{id}/toggle', [DashboardController::class, 'toggleReportStatus']);
        Route::delete('/reports/{id}', [DashboardController::class, 'deleteReport']);
        
        Route::get('/comments', [DashboardController::class, 'comments']);
        Route::delete('/comments/{id}', [DashboardController::class, 'deleteComment']);
    });
});