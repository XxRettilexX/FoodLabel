<?php

namespace App\Services\Modules\Labels;

use App\Models\Modules\Labels\Models\Label;
use App\Models\Modules\Lots\Models\Lot;
use Illuminate\Support\Str;

class LabelService
{
    /**
     * Genera un'etichetta associata al lotto con i relativi Payload QR/Barcode.
     */
    public function generateLabelForLot(Lot $lot, int $userId): Label
    {
        $lot->loadMissing('product.supplier');

        // Generazione Label Code Univoco: LBL-YYYYMMDD-LOTID-RAND
        $dateStr = now()->format('Ymd');
        $labelCode = "LBL-{$dateStr}-{$lot->id}-" . strtoupper(Str::random(4));

        // Il barcode "fisico" (puro codice)
        $barcode = $lot->batch_number;

        // Il payload del QR Code: contiene un JSON compatto leggibile dai dispositivi
        // In alternativa potrebbe essere una DeepLink URL al server
        $qrPayload = json_encode([
            'label_code' => $labelCode,
            'lot_id' => $lot->id,
            'batch' => $lot->batch_number,
            'product' => $lot->product->name ?? 'N/A',
            'supplier' => $lot->product->supplier->name ?? 'N/A',
            'produced' => $lot->produced_at ? $lot->produced_at->format('Y-m-d') : null,
            'expires' => $lot->expires_at->format('Y-m-d'),
            'qty' => $lot->current_quantity . ' ' . $lot->unit,
            'status' => $lot->status
        ]);

        return Label::create([
            'lot_id' => $lot->id,
            'user_id' => $userId,
            'label_code' => $labelCode,
            'qr_data' => $qrPayload,
            'barcode' => $barcode
        ]);
    }

    /**
     * Recupera Payload Completo per interfacciamento Frontend
     */
    public function getLabelPayload(Label $label): array
    {
        $label->loadMissing('lot.product.supplier');
        $lot = $label->lot;

        return [
            'label_code' => $label->label_code,
            'barcode_value' => $label->barcode,
            'qr_value' => $label->qr_data,
            'readable_data' => [
                'batch_number' => $lot->batch_number,
                'product_name' => $lot->product->name,
                'supplier_name' => $lot->product->supplier->name ?? 'N/A',
                'produced_at' => $lot->produced_at,
                'expires_at' => $lot->expires_at,
                'quantity' => $lot->initial_quantity,
                'unit' => $lot->unit,
                'printed_by' => $label->user_id,
                'created_at' => $label->created_at->format('Y-m-d H:i:s')
            ]
        ];
    }
}
