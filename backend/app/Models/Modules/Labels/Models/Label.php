<?php

namespace App\Models\Modules\Labels\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Label extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Labels\Models\LabelFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = ['account_id', 'lot_id', 'user_id', 'label_code', 'qr_data', 'barcode'];

    public function lot() { 
        return $this->belongsTo(\App\Models\Modules\Lots\Models\Lot::class); 
    }
    public function printedBy() { 
        return $this->belongsTo(\App\Models\User::class, 'user_id'); 
    }
}
