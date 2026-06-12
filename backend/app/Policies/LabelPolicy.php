<?php

namespace App\Policies;

use App\Models\Modules\Labels\Models\Label;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class LabelPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, Label $label): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $label);
    }

    public function create(User $user): bool
    {
        return $this->canOperate($user);
    }

    public function delete(User $user, Label $label): bool
    {
        return $this->canOperate($user) && $this->belongsToAccount($user, $label);
    }
}
