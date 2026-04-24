<?php

namespace App\Http\Requests\Modules\Productions;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipe_id' => 'nullable|exists:recipes,id',
            'name' => 'required|string|max:255',
            'produced_at' => 'required|date',
            'output_quantity' => 'nullable|numeric|min:0.001',
            'output_unit' => 'nullable|string|in:kg,g,l,ml,pcs,pz',
            'notes' => 'nullable|string|max:3000',
            'inputs' => 'required|array|min:1|max:300',
            'inputs.*.lot_id' => 'required|integer|exists:lots,id|distinct',
            'inputs.*.product_id' => 'required|integer|exists:products,id',
            'inputs.*.quantity_used' => 'required|numeric|min:0.001',
            'inputs.*.unit' => 'required|string|in:kg,g,l,ml,pcs,pz',
            'inputs.*.notes' => 'nullable|string|max:1000',
        ];
    }
}
