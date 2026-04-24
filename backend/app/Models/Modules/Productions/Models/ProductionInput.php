<?php

namespace App\Models\Modules\Productions\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionInput extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Productions\Models\ProductionInputFactory> */
    use HasFactory;

    protected $fillable = [
        'production_id',
        'lot_id',
        'product_id',
        'quantity_used',
        'unit',
        'notes',
    ];

    protected $casts = [
        'quantity_used' => 'decimal:3',
    ];

    public function production()
    {
        return $this->belongsTo(Production::class);
    }

    public function lot()
    {
        return $this->belongsTo(\App\Models\Modules\Lots\Models\Lot::class);
    }

    public function product()
    {
        return $this->belongsTo(\App\Models\Modules\Products\Models\Product::class);
    }
}
