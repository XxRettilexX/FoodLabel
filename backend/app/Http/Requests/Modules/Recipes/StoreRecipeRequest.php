<?php

namespace App\Http\Requests\Modules\Recipes;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:100|unique:recipes,code',
            'description' => 'nullable|string|max:3000',
            'yield_quantity' => 'nullable|numeric|min:0.001',
            'yield_unit' => 'nullable|string|in:kg,g,l,ml,pcs',
            'is_active' => 'sometimes|boolean',
            'items' => 'sometimes|array|max:150',
            'items.*.product_id' => 'required_with:items|integer|exists:products,id|distinct',
            'items.*.quantity' => 'required_with:items|numeric|min:0.001',
            'items.*.unit' => 'required_with:items|string|in:kg,g,l,ml,pcs',
            'items.*.notes' => 'nullable|string|max:1000',
        ];
    }
}
