<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuditService
{
    private const SENSITIVE_KEYS = ['password', 'remember_token'];

    public function log(
        string $action,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null,
        ?User $user = null,
    ): AuditLog {
        $user ??= auth('sanctum')->user();
        $request = request();

        return AuditLog::create([
            'account_id' => $user?->account_id ?? $auditable?->account_id,
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => $auditable ? class_basename($auditable) : ($metadata['auditable_type'] ?? 'system'),
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $this->sanitize($oldValues),
            'new_values' => $this->sanitize($newValues),
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent()
                ? Str::limit($request->userAgent(), 512, '')
                : null,
        ]);
    }

    public function logModelChange(
        string $action,
        Model $model,
        ?array $oldValues = null,
        ?array $metadata = null,
        ?User $user = null,
    ): AuditLog {
        return $this->log(
            action: $action,
            auditable: $model,
            oldValues: $oldValues,
            newValues: $this->snapshot($model),
            metadata: $metadata,
            user: $user,
        );
    }

    public function snapshot(Model $model): array
    {
        return $this->sanitize($model->getAttributes());
    }

    private function sanitize(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        return collect($values)
            ->except(self::SENSITIVE_KEYS)
            ->all();
    }
}
