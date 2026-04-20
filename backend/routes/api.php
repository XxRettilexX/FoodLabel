<?php

use App\Http\Controllers\Modules\Suppliers\Controllers\SupplierController;
use App\Http\Controllers\Modules\Products\Controllers\ProductController;
use App\Http\Controllers\Modules\Lots\Controllers\LotController;
use App\Http\Controllers\Modules\InventoryMovements\Controllers\InventoryMovementController;
use App\Http\Controllers\Modules\Labels\Controllers\LabelController;
use App\Http\Controllers\Modules\Alerts\Controllers\AlertController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth routes placeholder (optional)
    Route::post('/login', function() { return response()->json(['token' => 'placeholder']); });
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Domains
        Route::apiResource('suppliers', SupplierController::class);
        Route::apiResource('products', ProductController::class);
        Route::apiResource('lots', LotController::class);
        Route::apiResource('inventory-movements', InventoryMovementController::class);
        Route::apiResource('labels', LabelController::class);
        Route::apiResource('alerts', AlertController::class);
    });
});
