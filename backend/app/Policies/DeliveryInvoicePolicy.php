<?php

namespace App\Policies;

use App\Models\Modules\Invoices\Models\DeliveryInvoice;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class DeliveryInvoicePolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, DeliveryInvoice $deliveryInvoice): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $deliveryInvoice);
    }

    public function create(User $user): bool
    {
        return $this->canOperate($user);
    }

    public function update(User $user, DeliveryInvoice $deliveryInvoice): bool
    {
        return $this->canOperate($user) && $this->belongsToAccount($user, $deliveryInvoice);
    }

    public function delete(User $user, DeliveryInvoice $deliveryInvoice): bool
    {
        return $this->canOperate($user) && $this->belongsToAccount($user, $deliveryInvoice);
    }
}
