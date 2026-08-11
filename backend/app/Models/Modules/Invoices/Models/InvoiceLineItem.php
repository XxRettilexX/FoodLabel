<?php

namespace App\Models\Modules\Invoices\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceLineItem extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Invoices\Models\InvoiceLineItemFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = [
        'account_id',
        'delivery_invoice_id',
        'product_id',
        'lot_id',
        'raw_product_name',
        'quantity',
        'unit',
        'batch_number',
        'expires_at',
        'confidence_score',
        'status',
    ];

    protected $casts = [
        'expires_at' => 'date',
        'quantity' => 'decimal:3',
        'confidence_score' => 'decimal:3',
    ];

    public function invoice() {
        return $this->belongsTo(DeliveryInvoice::class, 'delivery_invoice_id');
    }

    public function product() {
        return $this->belongsTo(\App\Models\Modules\Products\Models\Product::class);
    }

    public function lot() {
        return $this->belongsTo(\App\Models\Modules\Lots\Models\Lot::class);
    }
}
