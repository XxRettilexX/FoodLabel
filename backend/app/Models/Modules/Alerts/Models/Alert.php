<?php

namespace App\Models\Modules\Alerts\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Alerts\Models\AlertFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = ['account_id', 'lot_id', 'type', 'status', 'resolved_by'];

    public function lot() { 
        return $this->belongsTo(\App\Models\Modules\Lots\Models\Lot::class); 
    }
    public function resolver() { 
        return $this->belongsTo(\App\Models\User::class, 'resolved_by'); 
    }
}
