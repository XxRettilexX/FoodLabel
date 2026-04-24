<?php

namespace App\Services\Modules\Lots;

use App\Models\Modules\Lots\Models\Lot;
use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Exception;

class LotService
{
    /**
     * Crea un lotto e registra automaticamente il movimento di ingresso iniziale.
     */
    public function receiveLot(array $data, int $userId): Lot
    {
        return DB::transaction(function () use ($data, $userId) {
            $user = \App\Models\User::findOrFail($userId);
            $data['account_id'] = $user->account_id;
            $data['current_quantity'] = $data['initial_quantity'];
            $data['user_id'] = $userId;
            $data['status'] = 'active';

            $lot = Lot::create($data);

            if ($lot->initial_quantity > 0) {
                InventoryMovement::create([
                    'account_id' => $user->account_id,
                    'lot_id' => $lot->id,
                    'user_id' => $userId,
                    'type' => 'IN',
                    'quantity' => $lot->initial_quantity,
                    'notes' => $data['notes'] ?? 'Carico iniziale del lotto',
                ]);
            }

            return $lot;
        });
    }

    public function markAs(Lot $lot, string $status): Lot
    {
        if (!in_array($status, ['active', 'consumed', 'expired', 'quarantined'])) {
            throw new Exception("Status non valido.");
        }

        $lot->update(['status' => $status]);
        return $lot;
    }

    public function getLotDetails(Lot $lot): Lot
    {
        return $lot->load(['product.supplier', 'movements.user', 'createdBy', 'labels', 'alerts']);
    }
}
