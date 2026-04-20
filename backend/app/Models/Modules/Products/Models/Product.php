<?php

namespace App\Models\Modules\Products\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Products\Models\ProductFactory> */
    use HasFactory;

    protected $fillable = ['name', 'supplier_id', 'description', 'default_shelf_life_days'];

    public function supplier() { 
        return $this->belongsTo(\App\Models\Modules\Suppliers\Models\Supplier::class); 
    }

    public function lots() { 
        return $this->hasMany(\App\Models\Modules\Lots\Models\Lot::class); 
    }
}
