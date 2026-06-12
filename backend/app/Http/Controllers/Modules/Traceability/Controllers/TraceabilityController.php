<?php

namespace App\Http\Controllers\Modules\Traceability\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Modules\Lots\Models\Lot;
use App\Models\Modules\Productions\Models\Production;
use App\Services\Modules\Traceability\TraceabilityService;

class TraceabilityController extends Controller
{
    public function __construct(private TraceabilityService $traceabilityService)
    {}

    public function productionGenealogy(Production $production)
    {
        $this->authorize('view', $production);

        return response()->json([
            'data' => $this->traceabilityService->getProductionGenealogy($production),
        ]);
    }

    public function lotUsageHistory(Lot $lot)
    {
        $this->authorize('view', $lot);

        return response()->json([
            'data' => $this->traceabilityService->getLotUsageHistory($lot),
        ]);
    }
}
