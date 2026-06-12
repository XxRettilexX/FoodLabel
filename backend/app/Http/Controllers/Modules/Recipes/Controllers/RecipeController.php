<?php

namespace App\Http\Controllers\Modules\Recipes\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Recipes\StoreRecipeRequest;
use App\Http\Requests\Modules\Recipes\UpdateRecipeRequest;
use App\Models\Modules\Recipes\Models\Recipe;
use App\Services\Audit\AuditService;
use App\Services\Modules\Recipes\RecipeService;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function __construct(
        private RecipeService $recipeService,
        private AuditService $audit,
    ) {
        $this->authorizeResource(Recipe::class, 'recipe');
    }

    public function index(Request $request)
    {
        $search = $request->query('q');
        $isActive = $request->has('is_active')
            ? filter_var($request->query('is_active'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE)
            : null;

        return response()->json([
            'data' => $this->recipeService->getAll($search, $isActive),
        ]);
    }

    public function store(StoreRecipeRequest $request)
    {
        $recipe = $this->recipeService->create($request->validated(), $request->user()->id);

        return response()->json(['data' => $recipe], 201);
    }

    public function show(Recipe $recipe)
    {
        return response()->json([
            'data' => $recipe->load('items.product'),
        ]);
    }

    public function update(UpdateRecipeRequest $request, Recipe $recipe)
    {
        $updated = $this->recipeService->update($recipe, $request->validated(), $request->user()->id);

        return response()->json(['data' => $updated]);
    }

    public function destroy(Recipe $recipe)
    {
        $this->audit->logModelChange('deleted', $recipe, oldValues: $this->audit->snapshot($recipe));
        $recipe->delete();

        return response()->json(null, 204);
    }
}
