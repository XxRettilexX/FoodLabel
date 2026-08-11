<?php

namespace App\Services\Modules\Invoices;

use App\Models\Modules\Invoices\Models\DeliveryInvoice;
use App\Models\Modules\Invoices\Models\InvoiceLineItem;
use App\Models\Modules\Lots\Models\Lot;
use App\Services\Audit\AuditService;
use App\Services\Modules\Lots\LotService;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InvoiceConfirmationService
{
    public function __construct(
        private LotService $lotService,
        private AuditService $audit,
    ) {
    }

    /**
     * Conferma una fattura revisionata: crea un Lot (+ movimento di carico IN)
     * per ogni riga non scartata, riusando LotService::receiveLot per non
     * duplicare la logica gia' esistente di creazione lotto/movimento.
     *
     * @return array{invoice: DeliveryInvoice, lots: Collection<int, Lot>}
     */
    public function confirm(DeliveryInvoice $invoice, int $userId): array
    {
        if ($invoice->status === 'confirmed') {
            throw new Exception('Questa fattura e\' gia\' stata confermata.');
        }

        $lines = $invoice->lineItems()->with('product')->where('status', '!=', 'rejected')->get();

        if ($lines->isEmpty()) {
            throw new Exception('Nessuna riga da confermare: sono state tutte scartate.');
        }

        $missingProduct = $lines->filter(fn (InvoiceLineItem $line) => !$line->product_id);
        if ($missingProduct->isNotEmpty()) {
            throw new Exception(
                'Collega un prodotto alle righe seguenti prima di confermare: '
                .$missingProduct->pluck('raw_product_name')->implode(', ')
            );
        }

        return DB::transaction(function () use ($invoice, $lines, $userId) {
            $lots = collect();

            foreach ($lines as $line) {
                $lot = $this->lotService->receiveLot([
                    'product_id' => $line->product_id,
                    'batch_number' => $this->resolveBatchNumber($line),
                    'produced_at' => null,
                    'expires_at' => $this->resolveExpiresAt($line),
                    'initial_quantity' => $line->quantity,
                    'unit' => $line->unit,
                    'notes' => 'Creato da fattura #'.$invoice->id.($invoice->invoice_number ? " ({$invoice->invoice_number})" : ''),
                ], $userId);

                $line->update(['lot_id' => $lot->id, 'status' => 'confirmed']);
                $lots->push($lot);
            }

            $invoice->update(['status' => 'confirmed']);
            $this->audit->logModelChange(
                'confirmed',
                $invoice->fresh(),
                metadata: ['lot_ids' => $lots->pluck('id')->all()],
            );

            return [
                'invoice' => $invoice->fresh('lineItems.lot', 'lineItems.product'),
                'lots' => $lots,
            ];
        });
    }

    private function resolveBatchNumber(InvoiceLineItem $line): string
    {
        return $line->batch_number ?: 'FTR-'.$line->delivery_invoice_id.'-'.$line->id;
    }

    private function resolveExpiresAt(InvoiceLineItem $line): string
    {
        if ($line->expires_at) {
            return $line->expires_at->toDateString();
        }

        $shelfLifeDays = $line->product?->default_shelf_life_days;
        $days = $shelfLifeDays && $shelfLifeDays > 0 ? (int) $shelfLifeDays : 30;

        return now()->addDays($days)->toDateString();
    }
}
