<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Non autorizzato.'], 401);
        }

        if ($request->user()->status !== 'active') {
            return response()->json(['message' => 'Utente disabilitato.'], 403);
        }

        if (!in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Azione non consentita per il tuo ruolo.'], 403);
        }

        return $next($request);
    }
}
