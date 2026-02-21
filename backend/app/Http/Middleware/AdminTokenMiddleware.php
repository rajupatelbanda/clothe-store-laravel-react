<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AdminTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->query('token');
        if (!$token) return response()->json(['message' => 'Missing token'], 401);

        $accessToken = PersonalAccessToken::findToken($token);
        if (!$accessToken || !$accessToken->tokenable || $accessToken->tokenable->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        auth()->login($accessToken->tokenable);
        return $next($request);
    }
}
