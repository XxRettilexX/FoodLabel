<?php

namespace App\Models\Modules\Recipes\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeItem extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Recipes\Models\RecipeItemFactory> */
    use HasFactory;

    protected $fillable = [
        'recipe_id',
        'product_id',
        'quantity',
        'unit',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function product()
    {
        return $this->belongsTo(\App\Models\Modules\Products\Models\Product::class);
    }
}
