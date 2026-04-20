<?php

namespace App\Models\Modules\Labels\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Labels\Models\LabelFactory> */
    use HasFactory;

    protected $fillable = ['lot_id', 'user_id', 'qr_code_path', 'barcode'];

    public function lot() { 
        return $this->belongsTo(\App\Models\Modules\Lots\Models\Lot::class); 
    }
    public function printedBy() { 
        return $this->belongsTo(\App\Models\User::class, 'user_id'); 
    }
}
