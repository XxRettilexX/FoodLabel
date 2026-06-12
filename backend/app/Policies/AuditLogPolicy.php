<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class AuditLogPolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canManage($user);
    }

    public function view(User $user, AuditLog $auditLog): bool
    {
        return $this->canManage($user)
            && (int) $user->account_id === (int) $auditLog->account_id;
    }
}
