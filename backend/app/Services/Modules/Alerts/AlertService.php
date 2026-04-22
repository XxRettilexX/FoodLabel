<?php

namespace App\Services\Modules\Alerts;

use App\Models\Modules\Alerts\Models\Alert;
use App\Models\Modules\Lots\Models\Lot;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AlertService
{
    private const LOW_STOCK_RATIO = 0.20;
    private const EXPIRING_DAYS = 7;

    public function refresh(): void
    {
        $today = Carbon::today();

        Lot::query()
            ->whereDate('expires_at', '<', $today)
            ->where('status', '!=', 'expired')
            ->update(['status' => 'expired']);

        $lots = Lot::query()
            ->with('product')
            ->whereIn('status', ['active', 'expired'])
            ->get();

        $activeSignatures = [];

        foreach ($lots as $lot) {
            foreach ($this->buildAlertsForLot($lot, $today) as $alertData) {
                $signature = "{$lot->id}:{$alertData['type']}";
                $activeSignatures[] = $signature;

                Alert::query()->updateOrCreate(
                    ['lot_id' => $lot->id, 'type' => $alertData['type'], 'status' => 'pending'],
                    ['resolved_by' => null]
                );
            }
        }

        Alert::query()
            ->where('status', 'pending')
            ->get()
            ->each(function (Alert $alert) use ($activeSignatures) {
                $signature = "{$alert->lot_id}:{$alert->type}";
                if (!in_array($signature, $activeSignatures, true)) {
                    $alert->update(['status' => 'resolved']);
                }
            });
    }

    public function getDashboard(?string $type = null): array
    {
        $today = Carbon::today();

        $lots = Lot::query()
            ->with('product')
            ->whereIn('status', ['active', 'expired'])
            ->orderBy('expires_at')
            ->get();

        $items = $lots
            ->flatMap(fn (Lot $lot) => $this->buildAlertsForLot($lot, $today))
            ->values();

        if ($type) {
            $items = $items->where('type', $type)->values();
        }

        return [
            'items' => $items->all(),
            'counts' => [
                'expiring_soon' => $items->where('type', 'expiring_soon')->count(),
                'expired' => $items->where('type', 'expired')->count(),
                'low_stock' => $items->where('type', 'low_stock')->count(),
            ],
        ];
    }

    private function buildAlertsForLot(Lot $lot, Carbon $today): Collection
    {
        $alerts = collect();
        $expiresAt = Carbon::parse($lot->expires_at)->startOfDay();
        $daysToExpiry = $today->diffInDays($expiresAt, false);
        $productName = $lot->product?->name ?? 'Prodotto sconosciuto';

        if ($daysToExpiry < 0 || $lot->status === 'expired') {
            $alerts->push([
                'type' => 'expired',
                'priority' => 'high',
                'title' => 'Lotto scaduto',
                'message' => "{$productName} ({$lot->batch_number}) risulta scaduto.",
                'lot_id' => $lot->id,
                'batch_number' => $lot->batch_number,
                'product_name' => $productName,
                'expires_at' => optional($lot->expires_at)->format('Y-m-d'),
                'current_quantity' => $lot->current_quantity,
                'unit' => $lot->unit,
            ]);
        } elseif ($daysToExpiry <= self::EXPIRING_DAYS) {
            $alerts->push([
                'type' => 'expiring_soon',
                'priority' => 'medium',
                'title' => 'Lotto in scadenza',
                'message' => "{$productName} ({$lot->batch_number}) scade tra {$daysToExpiry} giorni.",
                'lot_id' => $lot->id,
                'batch_number' => $lot->batch_number,
                'product_name' => $productName,
                'expires_at' => optional($lot->expires_at)->format('Y-m-d'),
                'current_quantity' => $lot->current_quantity,
                'unit' => $lot->unit,
            ]);
        }

        $threshold = max(1, (int) ceil(((float) $lot->initial_quantity) * self::LOW_STOCK_RATIO));
        if ((float) $lot->current_quantity <= $threshold && (float) $lot->current_quantity > 0) {
            $alerts->push([
                'type' => 'low_stock',
                'priority' => 'medium',
                'title' => 'Prodotto sotto soglia',
                'message' => "{$productName} ({$lot->batch_number}) sotto soglia: {$lot->current_quantity} {$lot->unit}.",
                'lot_id' => $lot->id,
                'batch_number' => $lot->batch_number,
                'product_name' => $productName,
                'expires_at' => optional($lot->expires_at)->format('Y-m-d'),
                'current_quantity' => $lot->current_quantity,
                'unit' => $lot->unit,
            ]);
        }

        return $alerts;
    }
}
