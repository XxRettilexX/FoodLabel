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
    {
        $this->authorizeResource(InventoryMovement::class, 'inventory_movement');
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'lot_id' => 'sometimes|integer|min:1',
        ]);

        // Bug fix: query params arrive as strings; passing them to int $lotId caused TypeError on PHP 8+.
        $lotId = isset($validated['lot_id']) ? (int) $validated['lot_id'] : null;

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
            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Operazione non valida.',
            ], 400);
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
