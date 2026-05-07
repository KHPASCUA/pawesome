<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // Debug token validation
        Log::info('API TOKEN AUTH DEBUG', [
            'path' => $request->path(),
            'method' => $request->method(),
            'has_user' => $request->user() ? 'yes' : 'no',
            'has_bearer_token' => $request->bearerToken() ? 'yes' : 'no',
            'auth_header' => $request->header('Authorization') ? 'present' : 'missing'
        ]);

        $token = $request->bearerToken();

        if (!$token && $request->user()) {
            Log::info('API TOKEN AUTH: User already authenticated without bearer token');
            return $next($request);
        }

        if (!$token) {
            Log::warning('API TOKEN AUTH: No bearer token found');
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Find the access token
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken) {
            Log::warning('API TOKEN AUTH: Token not found in database', [
                'token_preview' => substr($token, 0, 20) . '...'
            ]);
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        Log::info('API TOKEN AUTH: Token found', [
            'token_id' => $accessToken->id,
            'tokenable_type' => $accessToken->tokenable_type
        ]);

        // Get the user from the token
        $user = $accessToken->tokenable;

        if (!$user) {
            Log::error('API TOKEN AUTH: No user associated with token', [
                'token_id' => $accessToken->id
            ]);
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        Log::info('API TOKEN AUTH: User resolved', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_email' => $user->email
        ]);

        if (method_exists($user, 'withAccessToken')) {
            $user->withAccessToken($accessToken);
        }

        Auth::setUser($user);

        // Set the user on the request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}
