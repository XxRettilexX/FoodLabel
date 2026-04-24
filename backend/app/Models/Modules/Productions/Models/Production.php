<?php

namespace App\Models\Modules\Productions\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Productions\Models\ProductionFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = [
        'account_id',
        'recipe_id',
        'name',
        'produced_at',
        'output_quantity',
        'output_unit',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'produced_at' => 'datetime',
        'output_quantity' => 'decimal:3',
    ];

    public function recipe()
    {
        return $this->belongsTo(\App\Models\Modules\Recipes\Models\Recipe::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function inputs()
    {
        return $this->hasMany(ProductionInput::class);
    }
}
