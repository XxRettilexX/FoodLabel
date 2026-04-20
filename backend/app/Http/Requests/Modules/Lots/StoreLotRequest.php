<?php

namespace App\Http\Requests\Modules\Lots;

use Illuminate\Foundation\Http\FormRequest;

class StoreLotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'batch_number' => 'required|string|unique:lots,batch_number',
            'produced_at' => 'nullable|date',
            'expires_at' => 'required|date',
            'initial_quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|in:kg,g,l,pz',
            'notes' => 'nullable|string'
        ];
    }
}
