<?php

namespace App\Http\Requests\Modules\Invoices;

use App\Models\Modules\Invoices\Models\DeliveryInvoice;
use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', DeliveryInvoice::class);
    }

    public function rules(): array
    {
        return [
            'supplier_id' => ['required', AccountRules::exists('suppliers')],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,heic,pdf', 'max:15360'], // 15MB
        ];
    }
}
