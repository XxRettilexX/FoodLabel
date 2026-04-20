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
            'supplier_id' => 'nullable|exists:suppliers,id',
            'description' => 'nullable|string|max:1000',
            'default_shelf_life_days' => 'nullable|integer|min:1',
        ];
    }
}
