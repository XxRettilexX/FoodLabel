<?php

namespace App\Services\Modules\Recipes;

use App\Models\Modules\Recipes\Models\Recipe;
use Illuminate\Support\Facades\DB;

class RecipeService
{
    public function getAll(?string $search = null, ?bool $isActive = null)
    {
        $query = Recipe::query()->withCount('items');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (!is_null($isActive)) {
            $query->where('is_active', $isActive);
        }

        return $query->orderBy('name')->paginate(20);
    }

    public function create(array $data): Recipe
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $data['is_active'] = $data['is_active'] ?? true;
            $recipe = Recipe::create($data);

            if (!empty($items)) {
                $recipe->items()->createMany($items);
            }

            return $recipe->load('items.product');
        });
    }

    public function update(Recipe $recipe, array $data): Recipe
    {
        return DB::transaction(function () use ($recipe, $data) {
            $items = $data['items'] ?? null;
            unset($data['items']);

            $recipe->update($data);

            if (!is_null($items)) {
                $recipe->items()->delete();

                if (!empty($items)) {
                    $recipe->items()->createMany($items);
                }
            }

            return $recipe->fresh()->load('items.product');
        });
    }
}
