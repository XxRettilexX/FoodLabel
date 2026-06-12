<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

trait InteractsWithAccountRoles
{
    protected function canRead(User $user): bool
    {
        return $this->isActive($user)
            && in_array($user->role, ['owner', 'manager', 'warehouse', 'kitchen', 'viewer'], true);
    }

    protected function canOperate(User $user): bool
    {
        return $this->isActive($user)
            && in_array($user->role, ['owner', 'manager', 'warehouse', 'kitchen'], true);
    }

    protected function canManage(User $user): bool
    {
        return $this->isActive($user)
            && in_array($user->role, ['owner', 'manager'], true);
    }

    protected function belongsToAccount(User $user, Model $model): bool
    {
        return isset($model->account_id)
            && (int) $user->account_id === (int) $model->account_id;
    }

    protected function isActive(User $user): bool
    {
        return $user->status === 'active';
    }
}
