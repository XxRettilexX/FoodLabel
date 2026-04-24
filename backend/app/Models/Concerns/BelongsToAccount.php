<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToAccount
{
    protected static function bootBelongsToAccount(): void
    {
        static::addGlobalScope('account', function (Builder $builder) {
            $user = auth('sanctum')->user() ?? auth()->user();
            if (!$user || !$user->account_id) {
                return;
            }

            $builder->where($builder->getModel()->getTable().'.account_id', $user->account_id);
        });
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        $query = parent::resolveRouteBindingQuery($query, $value, $field);

        $user = auth('sanctum')->user() ?? auth()->user();
        if ($user && $user->account_id) {
            $query->where($this->getTable().'.account_id', $user->account_id);
        }

        return $query;
    }
}

