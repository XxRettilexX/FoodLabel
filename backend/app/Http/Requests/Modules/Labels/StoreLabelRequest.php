<?php

namespace App\Http\Requests\Modules\Labels;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lot_id' => 'required|exists:lots,id'
        ];
    }
}
