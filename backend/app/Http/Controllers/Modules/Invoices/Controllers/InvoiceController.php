<?php

namespace App\Http\Controllers\Modules\Invoices\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Invoices\StoreInvoiceScanRequest;
use App\Http\Requests\Modules\Invoices\UpdateInvoiceLineItemRequest;
use App\Models\Modules\Invoices\Models\DeliveryInvoice;
use App\Models\Modules\Invoices\Models\InvoiceLineItem;
use App\Services\Audit\AuditService;
use App\Services\Modules\Invoices\InvoiceConfirmationService;
use App\Services\Modules\Invoices\InvoiceExtractionService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        protected InvoiceExtractionService $extractionService,
        protected InvoiceConfirmationService $confirmationService,
        protected AuditService $audit,
    ) {
        $this->authorizeResource(DeliveryInvoice::class, 'delivery_invoice');
    }

    public function index()
    {
        $invoices = DeliveryInvoice::with('supplier')->latest()->paginate(20);

        return response()->json(['data' => $invoices]);
    }

    public function store(StoreInvoiceScanRequest $request)
    {
        try {
            $invoice = $this->extractionService->scanInvoice(
                $request->file('file'),
                (int) $request->validated()['supplier_id'],
                $request->user()->id,
            );

            return response()->json(['data' => $invoice], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => config('app.debug')
                    ? ('Errore nella scansione della fattura: '.$e->getMessage())
                    : 'Errore nella scansione della fattura.',
            ], 500);
        }
    }

    public function show(DeliveryInvoice $deliveryInvoice)
    {
        return response()->json([
            'data' => $deliveryInvoice->load(['supplier', 'lineItems.product', 'lineItems.lot']),
        ]);
    }

    /**
     * Editing manuale di una singola riga estratta, prima della conferma.
     */
    public function updateLineItem(UpdateInvoiceLineItemRequest $request, DeliveryInvoice $deliveryInvoice, InvoiceLineItem $lineItem)
    {
        $this->authorize('update', $deliveryInvoice);

        if ($lineItem->delivery_invoice_id !== $deliveryInvoice->id) {
            abort(404);
        }

        $oldValues = $this->audit->snapshot($lineItem);
        $lineItem->update($request->validated());
        $this->audit->logModelChange('updated', $lineItem->fresh(), oldValues: $oldValues);

        return response()->json(['data' => $lineItem->fresh('product')]);
    }

    /**
     * Conferma la fattura revisionata: crea Lot + InventoryMovement per ogni riga
     * non scartata (App\Services\Modules\Invoices\InvoiceConfirmationService).
     */
    public function confirm(Request $request, DeliveryInvoice $deliveryInvoice)
    {
        $this->authorize('update', $deliveryInvoice);

        try {
            $result = $this->confirmationService->confirm($deliveryInvoice, $request->user()->id);

            return response()->json(['data' => $result]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => config('app.debug') ? $e->getMessage() : 'Impossibile confermare la fattura.',
            ], 400);
        }
    }

    public function destroy(DeliveryInvoice $deliveryInvoice)
    {
        $this->audit->logModelChange('deleted', $deliveryInvoice, oldValues: $this->audit->snapshot($deliveryInvoice));
        $deliveryInvoice->delete();

        return response()->json(null, 204);
    }
}
