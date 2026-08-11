<?php

namespace App\Http\Requests\Modules\Suppliers;

use App\Models\Modules\Suppliers\Models\Supplier;
use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Supplier::class);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'vat_number' => ['nullable', 'string', 'max:50', AccountRules::unique('suppliers', 'vat_number')],
        ];
    }
}
