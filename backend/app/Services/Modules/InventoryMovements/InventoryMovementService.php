<?php

namespace App\Services\Modules\InventoryMovements;

use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use App\Models\Modules\Lots\Models\Lot;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryMovementService
{
    /**
     * Registra un nuovo movimento (IN/OUT/ADJUST) e aggiorna la quantità del lotto.
     */
    public function registerMovement(array $data, int $userId): InventoryMovement
    {
        return DB::transaction(function () use ($data, $userId) {
            $user = \App\Models\User::findOrFail($userId);
            $lot = Lot::findOrFail($data['lot_id']);

            $newQuantity = $lot->current_quantity;

            if ($data['type'] === 'IN') {
                $newQuantity += $data['quantity'];
            } elseif ($data['type'] === 'OUT') {
                if ($lot->current_quantity < $data['quantity']) {
                    throw new Exception("Quantità insufficiente nel lotto per completare l'OUT.");
                }
                $newQuantity -= $data['quantity'];
            } elseif ($data['type'] === 'ADJUST') {
                $newQuantity = $data['quantity']; // ADJUST riprogramma la giacenza
            }

            // Se il lotto si svuota, marcalo consumato in automatico
            if ($newQuantity <= 0 && $data['type'] === 'OUT') {
                $lot->status = 'consumed';
            }

            $lot->current_quantity = $newQuantity;
            $lot->save();

            $data['account_id'] = $user->account_id;
            $data['user_id'] = $userId;
            return InventoryMovement::create($data);
        });
    }

    public function getHistory(int $lotId = null)
    {
        $query = InventoryMovement::with(['lot.product', 'user']);
        
        if ($lotId) {
            $query->where('lot_id', $lotId);
        }

        return $query->orderBy('created_at', 'desc')->paginate(30);
    }
}
