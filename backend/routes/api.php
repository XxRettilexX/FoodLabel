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
use App\Http\Controllers\Modules\Audit\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Modules\Auth\Controllers\AuthController;

Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        Route::middleware('role:owner,manager')->group(function () {
            Route::get('audit-logs', [AuditLogController::class, 'index']);
            Route::get('audit-logs/{audit_log}', [AuditLogController::class, 'show']);
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

        Route::middleware('role:owner,manager,warehouse,kitchen,viewer')->group(function () {
            Route::get('products', [ProductController::class, 'index']);
            Route::get('products/by-barcode/{barcode}', [ProductController::class, 'findByBarcode']);
            Route::get('products/{product}', [ProductController::class, 'show']);
            Route::get('recipes', [RecipeController::class, 'index']);
            Route::get('recipes/{recipe}', [RecipeController::class, 'show']);
            Route::get('productions', [ProductionController::class, 'index']);
            Route::get('productions/{production}', [ProductionController::class, 'show']);
            Route::get('traceability/productions/{production}/genealogy', [TraceabilityController::class, 'productionGenealogy']);
            Route::get('traceability/lots/{lot}/usage-history', [TraceabilityController::class, 'lotUsageHistory']);
            Route::get('lots', [LotController::class, 'index']);
            Route::get('lots/{lot}', [LotController::class, 'show']);
            Route::get('inventory-movements', [InventoryMovementController::class, 'index']);
            Route::get('inventory-movements/{inventory_movement}', [InventoryMovementController::class, 'show']);
            Route::get('labels', [LabelController::class, 'index'])->middleware('throttle:scan');
            Route::get('labels/{label}', [LabelController::class, 'show'])->middleware('throttle:scan');
            Route::get('alerts', [AlertController::class, 'index']);
            Route::get('alerts/{alert}', [AlertController::class, 'show']);
        });

        Route::middleware('role:owner,manager,warehouse,kitchen')->group(function () {
            Route::post('productions', [ProductionController::class, 'store']);
            Route::patch('lots/{lot}/status', [LotController::class, 'updateStatus']);
            Route::post('lots', [LotController::class, 'store']);
            Route::put('lots/{lot}', [LotController::class, 'update']);
            Route::patch('lots/{lot}', [LotController::class, 'update']);
            Route::delete('lots/{lot}', [LotController::class, 'destroy']);
            Route::post('inventory-movements', [InventoryMovementController::class, 'store']);
            Route::post('labels', [LabelController::class, 'store'])->middleware('throttle:scan');
            Route::post('labels/{label}/print-network', [LabelController::class, 'printToIp']);
            Route::delete('labels/{label}', [LabelController::class, 'destroy'])->middleware('throttle:scan');
            Route::post('alerts/refresh', [AlertController::class, 'refresh']);
        });
    });
});
