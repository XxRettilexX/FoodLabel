<?php

namespace App\Models\Modules\Lots\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lot extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Lots\Models\LotFactory> */
    use HasFactory;

    protected $fillable = ['product_id', 'user_id', 'batch_number', 'produced_at', 'expires_at', 'initial_quantity', 'current_quantity', 'unit', 'status'];

    protected $casts = [
        'produced_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function product() { 
        return $this->belongsTo(\App\Models\Modules\Products\Models\Product::class); 
    }
    public function createdBy() { 
        return $this->belongsTo(\App\Models\User::class, 'user_id'); 
    }
    public function movements() { 
        return $this->hasMany(\App\Models\Modules\InventoryMovements\Models\InventoryMovement::class); 
    }
    public function labels() { 
        return $this->hasMany(\App\Models\Modules\Labels\Models\Label::class); 
    }
    public function alerts() { 
        return $this->hasMany(\App\Models\Modules\Alerts\Models\Alert::class); 
    }
}
