<?php

namespace App\Http\Requests\Modules\Lots;

use App\Models\Modules\Lots\Models\Lot;
use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreLotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Lot::class);
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', AccountRules::exists('products')],
            'batch_number' => ['required', 'string', AccountRules::unique('lots', 'batch_number')],
            'produced_at' => 'nullable|date',
            'expires_at' => 'required|date',
            'initial_quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|in:kg,g,l,pz',
            'notes' => 'nullable|string'
        ];
    }
}
