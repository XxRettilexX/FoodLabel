<?php

namespace App\Http\Requests\Modules\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:255|unique:products,barcode',
            'category' => 'nullable|string|max:100',
            'base_unit' => 'required|string|in:kg,g,l,ml,pcs',
            'is_active' => 'sometimes|boolean',
            'notes' => 'nullable|string|max:2000',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string|max:1000',
            'default_shelf_life_days' => 'nullable|integer|min:1',
        ];
    }
}
