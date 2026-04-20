<?php

namespace App\Http\Controllers\Modules\InventoryMovements\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\InventoryMovements\StoreInventoryMovementRequest;
use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use App\Services\Modules\InventoryMovements\InventoryMovementService;
use Illuminate\Http\Request;

class InventoryMovementController extends Controller
{
    public function __construct(protected InventoryMovementService $movementService)
    {}

    public function index(Request $request)
    {
        $lotId = $request->query('lot_id');
        return response()->json(['data' => $this->movementService->getHistory($lotId)]);
    }

    public function store(StoreInventoryMovementRequest $request)
    {
        try {
            $movement = $this->movementService->registerMovement(
                $request->validated(), 
                $request->user()->id
            );
            return response()->json(['data' => $movement], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function show(InventoryMovement $inventoryMovement)
    {
        return response()->json(['data' => $inventoryMovement->load('lot.product', 'user')]);
    }

    // UPDATE AND DESTROY are intentionally disabled for Movements. Data integrity!
    public function update() { return response()->json(['message' => 'Not allowed'], 405); }
    public function destroy() { return response()->json(['message' => 'Not allowed'], 405); }
}
