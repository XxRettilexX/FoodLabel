<?php

namespace App\Http\Controllers\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Services\Audit\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function __construct(private AuditService $audit)
    {
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenziali non valide.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Utente disabilitato.'
            ], 403);
        }

        $user->tokens()->where('name', 'auth_token')->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->audit->log(
            action: 'login',
            metadata: ['email' => $user->email, 'auditable_type' => 'User'],
            user: $user,
        );

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        $this->audit->log(
            action: 'logout',
            metadata: ['email' => $user->email, 'auditable_type' => 'User'],
            user: $user,
        );

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout effettuato con successo.'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()
        ]);
    }
}
