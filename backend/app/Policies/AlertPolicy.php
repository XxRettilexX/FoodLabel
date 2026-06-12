<?php

namespace App\Policies;

use App\Models\Modules\Alerts\Models\Alert;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class AlertPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, Alert $alert): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $alert);
    }

    public function refresh(User $user): bool
    {
        return $this->canOperate($user);
    }
}
