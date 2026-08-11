<?php

namespace App\Http\Requests\Modules\Invoices;

use App\Support\Validation\AccountRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceLineItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        // L'autorizzazione sulla fattura genitore viene verificata nel controller
        // (update su DeliveryInvoice), qui validiamo solo i dati della riga.
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['sometimes', 'nullable', AccountRules::exists('products')],
            'raw_product_name' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|numeric|min:0.001',
            'unit' => 'sometimes|string|in:kg,g,l,pz',
            'batch_number' => 'sometimes|nullable|string|max:255',
            'expires_at' => 'sometimes|nullable|date',
            'status' => 'sometimes|string|in:pending,confirmed,rejected',
        ];
    }
}
