<?php

namespace App\Models\Modules\Invoices\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryInvoice extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Invoices\Models\DeliveryInvoiceFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = [
        'account_id',
        'supplier_id',
        'user_id',
        'invoice_number',
        'invoice_date',
        'file_path',
        'file_mime',
        'status',
        'raw_ai_response',
        'failure_reason',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'raw_ai_response' => 'array',
    ];

    public function supplier() {
        return $this->belongsTo(\App\Models\Modules\Suppliers\Models\Supplier::class);
    }

    public function scannedBy() {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function lineItems() {
        return $this->hasMany(InvoiceLineItem::class);
    }
}
