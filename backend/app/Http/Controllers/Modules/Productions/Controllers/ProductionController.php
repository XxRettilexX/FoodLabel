<?php

namespace App\Http\Controllers\Modules\Productions\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Productions\StoreProductionRequest;
use App\Models\Modules\Productions\Models\Production;
use App\Services\Modules\Productions\ProductionService;
use Illuminate\Http\Request;
use Throwable;

class ProductionController extends Controller
{
    public function __construct(private ProductionService $productionService)
    {
        $this->authorizeResource(Production::class, 'production');
    }

    public function index(Request $request)
    {
        $recipeId = $request->query('recipe_id');

        return response()->json([
            'data' => $this->productionService->list($recipeId ? (int) $recipeId : null),
        ]);
    }

    public function store(StoreProductionRequest $request)
    {
        try {
            $production = $this->productionService->create(
                $request->validated(),
                $request->user()->id
            );

            return response()->json(['data' => $production], 201);
        } catch (Throwable $e) {
            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Operazione non valida.',
            ], 422);
        }
    }

    public function show(Production $production)
    {
        return response()->json([
            'data' => $this->productionService->detail($production),
        ]);
    }
}
