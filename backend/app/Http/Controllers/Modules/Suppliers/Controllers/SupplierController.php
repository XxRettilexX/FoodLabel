<?php

namespace App\Http\Controllers\Modules\Suppliers\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Suppliers\StoreSupplierRequest;
use App\Models\Modules\Suppliers\Models\Supplier;
use App\Services\Audit\AuditService;
use App\Support\Validation\AccountRules;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(protected AuditService $audit)
    {
        $this->authorizeResource(Supplier::class, 'supplier');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $query->where('name', 'like', "%{$search}%");
        }

        return response()->json(['data' => $query->orderBy('name')->paginate(50)]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSupplierRequest $request)
    {
        $user = $request->user();

        $supplier = Supplier::create([
            ...$request->validated(),
            'account_id' => $user->account_id,
        ]);

        $this->audit->logModelChange('created', $supplier, user: $user);

        return response()->json(['data' => $supplier], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Supplier $supplier)
    {
        return response()->json(['data' => $supplier]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'contact_email' => 'sometimes|nullable|email|max:255',
            'vat_number' => ['sometimes', 'nullable', 'string', 'max:50', AccountRules::unique('suppliers', 'vat_number', $supplier->id)],
        ]);

        $oldValues = $this->audit->snapshot($supplier);
        $supplier->update($validated);
        $this->audit->logModelChange('updated', $supplier->fresh(), oldValues: $oldValues);

        return response()->json(['data' => $supplier]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Supplier $supplier)
    {
        $this->audit->logModelChange('deleted', $supplier, oldValues: $this->audit->snapshot($supplier));
        $supplier->delete();

        return response()->json(null, 204);
    }
}
