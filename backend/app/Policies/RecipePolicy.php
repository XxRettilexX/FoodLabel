<?php

namespace App\Policies;

use App\Models\Modules\Recipes\Models\Recipe;
use App\Models\User;
use App\Policies\Concerns\InteractsWithAccountRoles;

class RecipePolicy
{
    use InteractsWithAccountRoles;

    public function viewAny(User $user): bool
    {
        return $this->canRead($user);
    }

    public function view(User $user, Recipe $recipe): bool
    {
        return $this->canRead($user) && $this->belongsToAccount($user, $recipe);
    }

    public function create(User $user): bool
    {
        return $this->canManage($user);
    }

    public function update(User $user, Recipe $recipe): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $recipe);
    }

    public function delete(User $user, Recipe $recipe): bool
    {
        return $this->canManage($user) && $this->belongsToAccount($user, $recipe);
    }
}
