<?php

namespace App\Http\Requests\Modules\Productions;

use App\Models\Modules\Productions\Models\Production;
use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Production::class);
    }

    public function rules(): array
    {
        return [
            'recipe_id' => ['nullable', AccountRules::exists('recipes')],
            'name' => 'required|string|max:255',
            'produced_at' => 'required|date',
            'output_quantity' => 'nullable|numeric|min:0.001',
            'output_unit' => 'nullable|string|in:kg,g,l,ml,pcs,pz',
            'notes' => 'nullable|string|max:3000',
            'inputs' => 'required|array|min:1|max:300',
            'inputs.*.lot_id' => ['required', 'integer', 'distinct', AccountRules::exists('lots')],
            'inputs.*.product_id' => ['required', 'integer', AccountRules::exists('products')],
            'inputs.*.quantity_used' => 'required|numeric|min:0.001',
            'inputs.*.unit' => 'required|string|in:kg,g,l,ml,pcs,pz',
            'inputs.*.notes' => 'nullable|string|max:1000',
        ];
    }
}
