<?php

namespace App\Policies;

use App\Models\Modules\Productions\Models\Production;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class ProductionPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, Production $production): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $production);
    }

    public function create(User $user): bool
    {
        return $this->canOperate($user);
    }
}
