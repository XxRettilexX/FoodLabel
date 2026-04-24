<?php

use App\Http\Controllers\Modules\Suppliers\Controllers\SupplierController;
use App\Http\Controllers\Modules\Products\Controllers\ProductController;
use App\Http\Controllers\Modules\Lots\Controllers\LotController;
use App\Http\Controllers\Modules\InventoryMovements\Controllers\InventoryMovementController;
use App\Http\Controllers\Modules\Labels\Controllers\LabelController;
use App\Http\Controllers\Modules\Alerts\Controllers\AlertController;
use App\Http\Controllers\Modules\Recipes\Controllers\RecipeController;
use App\Http\Controllers\Modules\Productions\Controllers\ProductionController;
use App\Http\Controllers\Modules\Traceability\Controllers\TraceabilityController;
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
            Route::post('products', [ProductController::class, 'store']);
            Route::put('products/{product}', [ProductController::class, 'update']);
            Route::patch('products/{product}', [ProductController::class, 'update']);
            Route::delete('products/{product}', [ProductController::class, 'destroy']);
            Route::post('recipes', [RecipeController::class, 'store']);
            Route::put('recipes/{recipe}', [RecipeController::class, 'update']);
            Route::patch('recipes/{recipe}', [RecipeController::class, 'update']);
            Route::delete('recipes/{recipe}', [RecipeController::class, 'destroy']);
        });

        // Accessible to Operator, Manager, Admin
        Route::middleware('role:admin,manager,operator')->group(function () {
            Route::get('products', [ProductController::class, 'index']);
            Route::get('products/by-barcode/{barcode}', [ProductController::class, 'findByBarcode']);
            Route::get('products/{product}', [ProductController::class, 'show']);
            Route::get('recipes', [RecipeController::class, 'index']);
            Route::get('recipes/{recipe}', [RecipeController::class, 'show']);
            Route::get('productions', [ProductionController::class, 'index']);
            Route::post('productions', [ProductionController::class, 'store']);
            Route::get('productions/{production}', [ProductionController::class, 'show']);
            Route::get('traceability/productions/{production}/genealogy', [TraceabilityController::class, 'productionGenealogy']);
            Route::get('traceability/lots/{lot}/usage-history', [TraceabilityController::class, 'lotUsageHistory']);
            Route::patch('lots/{lot}/status', [LotController::class, 'updateStatus']);
            Route::apiResource('lots', LotController::class);
            Route::apiResource('inventory-movements', InventoryMovementController::class);
            Route::apiResource('labels', LabelController::class);
            Route::post('alerts/refresh', [AlertController::class, 'refresh']);
            Route::apiResource('alerts', AlertController::class);
        });
    });
});
