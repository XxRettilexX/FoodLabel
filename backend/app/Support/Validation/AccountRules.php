<?php

namespace App\Support\Validation;

use Illuminate\Validation\Rule;

class AccountRules
{
    public static function exists(string $table, string $column = 'id')
    {
        $accountId = auth('sanctum')->user()?->account_id;

        $rule = Rule::exists($table, $column);

        if ($accountId !== null) {
            $rule->where('account_id', $accountId);
        }

        return $rule;
    }

    public static function unique(string $table, string $column, mixed $ignore = null, string $ignoreColumn = 'id')
    {
        $accountId = auth('sanctum')->user()?->account_id;

        $rule = Rule::unique($table, $column);

        if ($ignore !== null) {
            $rule->ignore($ignore, $ignoreColumn);
        }

        if ($accountId !== null) {
            $rule->where('account_id', $accountId);
        }

        return $rule;
    }
}
