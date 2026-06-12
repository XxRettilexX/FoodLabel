<?php

namespace App\Services\Modules\Recipes;

use App\Models\Modules\Recipes\Models\Recipe;
use App\Services\Audit\AuditService;
use Illuminate\Support\Facades\DB;

class RecipeService
{
    public function __construct(private AuditService $audit)
    {
    }
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

    public function create(array $data, int $userId): Recipe
    {
        return DB::transaction(function () use ($data, $userId) {
            $user = \App\Models\User::findOrFail($userId);
            $items = $data['items'] ?? [];
            unset($data['items']);

            $data['account_id'] = $user->account_id;
            $data['is_active'] = $data['is_active'] ?? true;
            $recipe = Recipe::create($data);
            $this->audit->logModelChange('created', $recipe, user: $user);

            if (!empty($items)) {
                $recipe->items()->createMany(array_map(function ($item) use ($user) {
                    return [
                        ...$item,
                        'account_id' => $user->account_id,
                    ];
                }, $items));
            }

            return $recipe->load('items.product');
        });
    }

    public function update(Recipe $recipe, array $data, int $userId): Recipe
    {
        return DB::transaction(function () use ($recipe, $data, $userId) {
            $user = \App\Models\User::findOrFail($userId);
            $items = $data['items'] ?? null;
            unset($data['items']);

            $oldValues = $this->audit->snapshot($recipe);
            $recipe->update($data);

            if (!is_null($items)) {
                $recipe->items()->delete();

                if (!empty($items)) {
                    $recipe->items()->createMany(array_map(function ($item) use ($user) {
                        return [
                            ...$item,
                            'account_id' => $user->account_id,
                        ];
                    }, $items));
                }
            }

            $updated = $recipe->fresh()->load('items.product');
            $this->audit->logModelChange('updated', $updated, oldValues: $oldValues, user: $user);

            return $updated;
        });
    }
}
