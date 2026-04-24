<?php

namespace App\Services\Modules\Traceability;

use App\Models\Modules\Lots\Models\Lot;
use App\Models\Modules\Productions\Models\Production;
use App\Models\Modules\Productions\Models\ProductionInput;

class TraceabilityService
{
    public function getProductionGenealogy(Production $production): array
    {
        $production->load([
            'recipe',
            'createdBy',
            'inputs.lot.product',
            'inputs.product',
        ]);

        $ingredients = $production->inputs->map(function (ProductionInput $input) {
            return [
                'production_input_id' => $input->id,
                'product' => [
                    'id' => $input->product?->id,
                    'name' => $input->product?->name,
                    'barcode' => $input->product?->barcode,
                    'sku' => $input->product?->sku,
                ],
                'lot' => [
                    'id' => $input->lot?->id,
                    'batch_number' => $input->lot?->batch_number,
                    'status' => $input->lot?->status,
                    'expires_at' => optional($input->lot?->expires_at)->format('Y-m-d H:i:s'),
                ],
                'quantity_used' => $input->quantity_used,
                'unit' => $input->unit,
                'notes' => $input->notes,
            ];
        })->values();

        return [
            'production' => [
                'id' => $production->id,
                'name' => $production->name,
                'produced_at' => optional($production->produced_at)->format('Y-m-d H:i:s'),
                'output_quantity' => $production->output_quantity,
                'output_unit' => $production->output_unit,
                'notes' => $production->notes,
                'created_by' => [
                    'id' => $production->createdBy?->id,
                    'name' => $production->createdBy?->name,
                ],
                'recipe' => $production->recipe ? [
                    'id' => $production->recipe->id,
                    'name' => $production->recipe->name,
                    'code' => $production->recipe->code,
                ] : null,
            ],
            'ingredients' => $ingredients,
            'meta' => [
                'ingredient_lines_count' => $ingredients->count(),
                'unique_lots_count' => $ingredients->pluck('lot.id')->filter()->unique()->count(),
                'unique_products_count' => $ingredients->pluck('product.id')->filter()->unique()->count(),
            ],
        ];
    }

    public function getLotUsageHistory(Lot $lot): array
    {
        $lot->load('product');

        $usages = ProductionInput::query()
            ->with([
                'production.recipe',
                'production.createdBy',
            ])
            ->where('lot_id', $lot->id)
            ->orderByDesc('created_at')
            ->get();

        return [
            'lot' => [
                'id' => $lot->id,
                'batch_number' => $lot->batch_number,
                'status' => $lot->status,
                'expires_at' => optional($lot->expires_at)->format('Y-m-d H:i:s'),
                'current_quantity' => $lot->current_quantity,
                'unit' => $lot->unit,
                'product' => [
                    'id' => $lot->product?->id,
                    'name' => $lot->product?->name,
                    'barcode' => $lot->product?->barcode,
                    'sku' => $lot->product?->sku,
                ],
            ],
            'usages' => $usages->map(function (ProductionInput $input) {
                return [
                    'production_input_id' => $input->id,
                    'quantity_used' => $input->quantity_used,
                    'unit' => $input->unit,
                    'notes' => $input->notes,
                    'production' => [
                        'id' => $input->production?->id,
                        'name' => $input->production?->name,
                        'produced_at' => optional($input->production?->produced_at)->format('Y-m-d H:i:s'),
                        'recipe' => $input->production?->recipe ? [
                            'id' => $input->production->recipe->id,
                            'name' => $input->production->recipe->name,
                            'code' => $input->production->recipe->code,
                        ] : null,
                        'created_by' => [
                            'id' => $input->production?->createdBy?->id,
                            'name' => $input->production?->createdBy?->name,
                        ],
                    ],
                ];
            })->values(),
            'meta' => [
                'usage_count' => $usages->count(),
                'total_quantity_used' => $usages->sum(fn (ProductionInput $item) => (float) $item->quantity_used),
            ],
        ];
    }
}
