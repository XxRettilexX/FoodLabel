<?php

namespace App\Policies;

use App\Models\Modules\Suppliers\Models\Supplier;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class SupplierPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canManage($user);
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $supplier);
    }

    public function create(User $user): bool
    {
        return $this->canManage($user);
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $supplier);
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $supplier);
    }
}
