<?php

namespace App\Policies;

use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class InventoryMovementPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, InventoryMovement $inventoryMovement): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $inventoryMovement);
    }

    public function create(User $user): bool
    {
        return $this->canOperate($user);
    }
}
