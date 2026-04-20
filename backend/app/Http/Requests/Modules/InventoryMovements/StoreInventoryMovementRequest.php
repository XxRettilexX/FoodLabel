<?php

namespace App\Http\Requests\Modules\InventoryMovements;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lot_id' => 'required|exists:lots,id',
            'type' => 'required|in:IN,OUT,ADJUST',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string'
        ];
    }
}
