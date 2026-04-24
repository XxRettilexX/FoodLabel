<?php

namespace App\Models\Modules\Recipes\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Recipes\Models\RecipeFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = [
        'account_id',
        'name',
        'code',
        'description',
        'yield_quantity',
        'yield_unit',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'yield_quantity' => 'decimal:3',
    ];

    public function items()
    {
        return $this->hasMany(RecipeItem::class);
    }
}
