<?php

namespace App\Models\Modules\Products\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Products\Models\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'barcode',
        'category',
        'base_unit',
        'is_active',
        'notes',
        'created_by',
        'updated_by',
        'supplier_id',
        'description',
        'default_shelf_life_days',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function supplier() { 
        return $this->belongsTo(\App\Models\Modules\Suppliers\Models\Supplier::class); 
    }

    public function lots() { 
        return $this->hasMany(\App\Models\Modules\Lots\Models\Lot::class); 
    }

    public function recipeItems() {
        return $this->hasMany(\App\Models\Modules\Recipes\Models\RecipeItem::class);
    }

    public function productionInputs() {
        return $this->hasMany(\App\Models\Modules\Productions\Models\ProductionInput::class);
    }

    public function createdBy() {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function updatedBy() {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }
}
