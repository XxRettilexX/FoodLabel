<?php

namespace App\Http\Requests\Modules\Labels;

use App\Models\Modules\Labels\Models\Label;
use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreLabelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Label::class);
    }

    public function rules(): array
    {
        return [
            'lot_id' => ['required', AccountRules::exists('lots')],
        ];
    }
}
