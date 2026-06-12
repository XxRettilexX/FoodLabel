<?php

namespace App\Policies;

use App\Models\Modules\Products\Models\Product;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class ProductPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, Product $product): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $product);
    }

    public function create(User $user): bool
    {
        return $this->canManage($user);
    }

    public function update(User $user, Product $product): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $product);
    }
}
