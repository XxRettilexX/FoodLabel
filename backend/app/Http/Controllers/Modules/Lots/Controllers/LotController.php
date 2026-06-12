<?php

namespace App\Http\Controllers\Modules\Lots\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Lots\StoreLotRequest;
use App\Models\Modules\Lots\Models\Lot;
use App\Services\Audit\AuditService;
use App\Services\Modules\Lots\LotService;
use Illuminate\Http\Request;

class LotController extends Controller
{
    public function __construct(
        protected LotService $lotService,
        protected AuditService $audit,
    ) {
        $this->authorizeResource(Lot::class, 'lot');
    }

    public function index()
    {
        $lots = Lot::with('product')->orderBy('expires_at', 'asc')->paginate(20);
        return response()->json(['data' => $lots]);
    }

    public function store(StoreLotRequest $request)
    {
        try {
            $lot = $this->lotService->receiveLot($request->validated(), $request->user()->id);
            return response()->json(['data' => $lot], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => config('app.debug')
                    ? ('Errore nella creazione del lotto: '.$e->getMessage())
                    : 'Errore nella creazione del lotto.',
            ], 500);
        }
    }

    public function show(Lot $lot)
    {
        return response()->json(['data' => $this->lotService->getLotDetails($lot)]);
    }

    public function update(Request $request, Lot $lot)
    {
        // Simple update for non-critical fields (e.g., notes, dates)
        $validated = $request->validate([
            'produced_at' => 'sometimes|nullable|date',
            'expires_at' => 'sometimes|date',
        ]);

        $oldValues = $this->audit->snapshot($lot);
        $lot->update($validated);
        $this->audit->logModelChange('updated', $lot->fresh(), oldValues: $oldValues);

        return response()->json(['data' => $lot]);
    }

    public function updateStatus(Request $request, Lot $lot)
    {
        $this->authorize('update', $lot);
        $validated = $request->validate([
            'status' => 'required|string|in:active,consumed,expired,quarantined',
        ]);

        try {
            $lot = $this->lotService->markAs($lot, $validated['status']);
            return response()->json(['data' => $lot]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Operazione non valida.',
            ], 400);
        }
    }

    public function destroy(Lot $lot)
    {
        $this->audit->logModelChange('deleted', $lot, oldValues: $this->audit->snapshot($lot));
        $lot->delete();

        return response()->json(null, 204);
    }
}
