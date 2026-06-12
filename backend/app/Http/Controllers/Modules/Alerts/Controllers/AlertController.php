<?php

namespace App\Http\Controllers\Modules\Alerts\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Modules\Alerts\Models\Alert;
use App\Services\Modules\Alerts\AlertService;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function __construct(private AlertService $alertService)
    {
        $this->authorizeResource(Alert::class, 'alert');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $type = $request->query('type');
        $dashboard = $this->alertService->getDashboard($type);

        return response()->json(['data' => $dashboard]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Alert $alert)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Alert $alert)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Alert $alert)
    {
        //
    }

    public function refresh()
    {
        $this->authorize('refresh', Alert::class);

        $this->alertService->refresh();

        return response()->json([
            'message' => 'Alert aggiornati con successo',
        ]);
    }
}
