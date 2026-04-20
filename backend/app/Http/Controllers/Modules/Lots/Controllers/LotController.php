<?php

namespace App\Http\Controllers\Modules\Lots\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Modules\Lots\Models\Lot;
use Illuminate\Http\Request;

class LotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lots = Lot::paginate(15);
        return response()->json(['data' => $lots]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'batch_number' => 'required|string|unique:lots,batch_number',
            'produced_at' => 'nullable|date',
            'expires_at' => 'required|date',
            'initial_quantity' => 'required|numeric|min:0',
        ]);
        
        $validated['current_quantity'] = $validated['initial_quantity'];

        $lot = Lot::create($validated);
        return response()->json(['data' => $lot], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Lot $lot)
    {
        return response()->json(['data' => $lot]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Lot $lot)
    {
        $validated = $request->validate([
            'current_quantity' => 'sometimes|required|numeric|min:0',
            'expires_at' => 'sometimes|required|date',
        ]);

        $lot->update($validated);
        return response()->json(['data' => $lot]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lot $lot)
    {
        $lot->delete();
        return response()->json(null, 204);
    }
}
