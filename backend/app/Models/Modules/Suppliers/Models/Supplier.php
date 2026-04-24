<?php

namespace App\Models\Modules\Suppliers\Models;

use App\Models\Concerns\BelongsToAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    /** @use HasFactory<\Database\Factories\Modules\Suppliers\Models\SupplierFactory> */
    use HasFactory, BelongsToAccount;

    protected $fillable = ['account_id', 'name', 'contact_email', 'vat_number'];

    public function products() { 
        return $this->hasMany(\App\Models\Modules\Products\Models\Product::class); 
    }
}
