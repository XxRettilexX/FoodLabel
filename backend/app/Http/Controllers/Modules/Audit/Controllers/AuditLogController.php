<?php

namespace App\Http\Controllers\Modules\Audit\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(AuditLog::class, 'audit_log');
    }

    public function index(Request $request)
    {
        $query = AuditLog::query()
            ->where('account_id', $request->user()->account_id)
            ->with('user:id,name,email,role')
            ->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->query('action'));
        }

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', $request->query('auditable_type'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->query('user_id'));
        }

        return response()->json([
            'data' => $query->paginate(50),
        ]);
    }

    public function show(AuditLog $audit_log)
    {
        $audit_log->load('user:id,name,email,role');

        return response()->json(['data' => $audit_log]);
    }
}
