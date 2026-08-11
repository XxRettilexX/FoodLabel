<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\Modules\Alerts\Models\Alert;
use App\Models\Modules\Invoices\Models\DeliveryInvoice;
use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use App\Models\Modules\Labels\Models\Label;
use App\Models\Modules\Lots\Models\Lot;
use App\Models\Modules\Productions\Models\Production;
use App\Models\Modules\Products\Models\Product;
use App\Models\Modules\Recipes\Models\Recipe;
use App\Models\Modules\Suppliers\Models\Supplier;
use App\Policies\AlertPolicy;
use App\Policies\AuditLogPolicy;
use App\Policies\DeliveryInvoicePolicy;
use App\Policies\InventoryMovementPolicy;
use App\Policies\LabelPolicy;
use App\Policies\LotPolicy;
use App\Policies\ProductPolicy;
use App\Policies\ProductionPolicy;
use App\Policies\RecipePolicy;
use App\Policies\SupplierPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Lot::class => LotPolicy::class,
        Recipe::class => RecipePolicy::class,
        Production::class => ProductionPolicy::class,
        InventoryMovement::class => InventoryMovementPolicy::class,
        Label::class => LabelPolicy::class,
        Supplier::class => SupplierPolicy::class,
        Alert::class => AlertPolicy::class,
        AuditLog::class => AuditLogPolicy::class,
        DeliveryInvoice::class => DeliveryInvoicePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
