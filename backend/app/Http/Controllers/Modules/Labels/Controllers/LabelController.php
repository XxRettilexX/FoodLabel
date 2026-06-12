<?php

namespace App\Http\Controllers\Modules\Labels\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Labels\StoreLabelRequest;
use App\Models\Modules\Labels\Models\Label;
use App\Models\Modules\Lots\Models\Lot;
use App\Services\Audit\AuditService;
use App\Services\Modules\Labels\LabelService;
use App\Support\Validation\AccountRules;
use Illuminate\Http\Request;

class LabelController extends Controller
{
    public function __construct(
        protected LabelService $labelService,
        protected AuditService $audit,
    ) {
        $this->authorizeResource(Label::class, 'label');
    }

    public function index(Request $request)
    {
        $request->validate([
            'lot_id' => ['sometimes', 'integer', AccountRules::exists('lots')],
            'search' => 'sometimes|string|max:512',
        ]);

        $query = Label::with(['lot.product', 'printedBy']);

        if ($request->has('lot_id')) {
            $query->where('lot_id', $request->query('lot_id'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));

            $query->where(function ($q) use ($search) {
                $q->where('label_code', $search)
                    ->orWhere('barcode', $search)
                    ->orWhere('qr_data', 'like', "%{$search}%");
            });
        }

        return response()->json(['data' => $query->latest()->paginate(20)]);
    }

    public function store(StoreLabelRequest $request)
    {
        try {
            $lot = Lot::findOrFail($request->validated()['lot_id']);
            $label = $this->labelService->generateLabelForLot($lot, $request->user()->id);
            
            return response()->json([
                'data' => $this->labelService->getLabelPayload($label)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => config('app.debug')
                    ? ('Errore nella generazione etichetta: '.$e->getMessage())
                    : 'Errore nella generazione etichetta.',
            ], 500);
        }
    }

    public function show(Label $label)
    {
        return response()->json(['data' => $this->labelService->getLabelPayload($label)]);
    }

    public function printView(Label $label)
    {
        // Ritorna una semplice e pulita visuale HTML predisposta per la stampa via browser,
        // contenente QR base64 e Barcode text.
        $payload = $this->labelService->getLabelPayload($label);
        return view('labels.print', ['payload' => $payload]);
    }

    public function update(Request $request, Label $label)
    {
        return response()->json(['message' => 'Etichetta immutabile. Generane una nuova.'], 405);
    }

    public function destroy(Label $label)
    {
        $this->audit->logModelChange('deleted', $label, oldValues: $this->audit->snapshot($label));
        $label->delete();

        return response()->json(null, 204);
    }
}
