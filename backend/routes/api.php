<?php

use App\Http\Controllers\Modules\Suppliers\Controllers\SupplierController;
use App\Http\Controllers\Modules\Products\Controllers\ProductController;
use App\Http\Controllers\Modules\Lots\Controllers\LotController;
use App\Http\Controllers\Modules\InventoryMovements\Controllers\InventoryMovementController;
use App\Http\Controllers\Modules\Labels\Controllers\LabelController;
use App\Http\Controllers\Modules\Alerts\Controllers\AlertController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Modules\Auth\Controllers\AuthController;

Route::prefix('v1')->group(function () {
    // Auth routes
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Restricted to Admin & Manager
        Route::middleware('role:admin,manager')->group(function () {
            Route::apiResource('suppliers', SupplierController::class);
            Route::apiResource('products', ProductController::class);
        });

        // Accessible to Operator, Manager, Admin
        Route::middleware('role:admin,manager,operator')->group(function () {
            Route::patch('lots/{lot}/status', [LotController::class, 'updateStatus']);
            Route::apiResource('lots', LotController::class);
            Route::apiResource('inventory-movements', InventoryMovementController::class);
            Route::apiResource('labels', LabelController::class);
            Route::apiResource('alerts', AlertController::class);
        });
    });
});
