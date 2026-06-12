<?php

namespace App\Http\Requests\Modules\InventoryMovements;

use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', InventoryMovement::class);
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['required', AccountRules::exists('lots')],
            'type' => 'required|in:IN,OUT,ADJUST',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string'
        ];
    }
}
