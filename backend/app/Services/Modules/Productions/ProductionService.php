<?php

namespace App\Services\Modules\Productions;

use App\Models\Modules\InventoryMovements\Models\InventoryMovement;
use App\Models\Modules\Lots\Models\Lot;
use App\Models\Modules\Productions\Models\Production;
use App\Services\Audit\AuditService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProductionService
{
    public function __construct(private AuditService $audit)
    {
    }
    public function list(?int $recipeId = null)
    {
        $query = Production::query()
            ->with(['recipe', 'createdBy'])
            ->withCount('inputs')
            ->orderByDesc('produced_at');

        if ($recipeId) {
            $query->where('recipe_id', $recipeId);
        }

        return $query->paginate(20);
    }

    public function detail(Production $production): Production
    {
        return $production->load([
            'recipe',
            'createdBy',
            'inputs.lot.product',
            'inputs.product',
        ]);
    }

    public function create(array $payload, int $userId): Production
    {
        return DB::transaction(function () use ($payload, $userId) {
            $user = \App\Models\User::findOrFail($userId);
            $inputs = $payload['inputs'] ?? [];
            unset($payload['inputs']);

            $payload['account_id'] = $user->account_id;
            $payload['created_by'] = $userId;
            $production = Production::create($payload);

            foreach ($inputs as $input) {
                /** @var Lot $lot */
                $lot = Lot::query()->lockForUpdate()->findOrFail($input['lot_id']);

                if ((int) $lot->product_id !== (int) $input['product_id']) {
                    throw new RuntimeException("Il prodotto selezionato non corrisponde al lotto {$lot->id}.");
                }

                $usedQty = (float) $input['quantity_used'];
                $availableQty = (float) $lot->current_quantity;
                if ($availableQty < $usedQty) {
                    throw new RuntimeException("Quantita insufficiente per il lotto {$lot->batch_number}.");
                }

                $lot->current_quantity = $availableQty - $usedQty;
                if ((float) $lot->current_quantity <= 0) {
                    $lot->status = 'consumed';
                }
                $lot->save();

                $production->inputs()->create([
                    ...$input,
                    'account_id' => $user->account_id,
                ]);

                InventoryMovement::create([
                    'account_id' => $user->account_id,
                    'lot_id' => $lot->id,
                    'user_id' => $userId,
                    'type' => 'OUT',
                    'quantity' => $usedQty,
                    'notes' => $input['notes'] ?? "Scarico per produzione #{$production->id}",
                ]);
            }

            $created = $this->detail($production->fresh());
            $this->audit->logModelChange(
                'created',
                $created,
                metadata: ['inputs_count' => count($inputs)],
                user: $user,
            );

            return $created;
        });
    }
}
