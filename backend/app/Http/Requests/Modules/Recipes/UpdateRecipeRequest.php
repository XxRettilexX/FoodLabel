<?php

namespace App\Http\Requests\Modules\Recipes;

use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('recipe'));
    }

    public function rules(): array
    {
        $recipeId = $this->route('recipe')?->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'code' => ['nullable', 'string', 'max:100', AccountRules::unique('recipes', 'code', $recipeId)],
            'description' => 'nullable|string|max:3000',
            'yield_quantity' => 'nullable|numeric|min:0.001',
            'yield_unit' => 'nullable|string|in:kg,g,l,ml,pcs',
            'is_active' => 'sometimes|boolean',
            'items' => 'sometimes|array|max:150',
            'items.*.product_id' => ['required_with:items', 'integer', 'distinct', AccountRules::exists('products')],
            'items.*.quantity' => 'required_with:items|numeric|min:0.001',
            'items.*.unit' => 'required_with:items|string|in:kg,g,l,ml,pcs',
            'items.*.notes' => 'nullable|string|max:1000',
        ];
    }
}
