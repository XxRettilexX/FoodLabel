<?php

namespace App\Policies;

use App\Models\Modules\Lots\Models\Lot;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class LotPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, Lot $lot): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $lot);
    }

    public function create(User $user): bool
    {
        return $this->canOperate($user);
    }

    public function update(User $user, Lot $lot): bool
    {
        return $this->canOperate($user) && $this->belongsToAccount($user, $lot);
    }

    public function delete(User $user, Lot $lot): bool
    {
        return $this->canOperate($user) && $this->belongsToAccount($user, $lot);
    }
}
