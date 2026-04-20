<?php

namespace App\Models\Modules\InventoryMovements\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\InventoryMovements\Models\InventoryMovementFactory> */
    use HasFactory;

    protected $fillable = ['lot_id', 'user_id', 'type', 'quantity', 'notes'];

    public function lot() { 
        return $this->belongsTo(\App\Models\Modules\Lots\Models\Lot::class); 
    }
    public function user() { 
        return $this->belongsTo(\App\Models\User::class); 
    }
}
