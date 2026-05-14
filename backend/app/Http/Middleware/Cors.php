<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 204);
            $this->applyCorsHeaders($request, $response);

            return $response;
        }

        $response = $next($request);

        $this->applyCorsHeaders($request, $response);

        return $response;
    }

    private function applyCorsHeaders(Request $request, $response): void
    {
        // Production-safe CORS configuration
        $allowedOrigins = $this->getAllowedOrigins();
        $origin = $request->header('Origin');
        $supportsCredentials = (bool) config('cors.supports_credentials', false);

        // Set appropriate origin based on environment
        if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
            $response->headers->set(
                'Access-Control-Allow-Origin',
                $supportsCredentials && $origin ? $origin : ($origin ?: '*')
            );
        } elseif (app()->environment('local', 'testing')) {
            $response->headers->set('Access-Control-Allow-Origin', $origin ?: '*');
        }

        // Standard CORS headers
        $response->headers->set(
            'Access-Control-Allow-Methods',
            implode(', ', config('cors.allowed_methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']))
        );
        $response->headers->set(
            'Access-Control-Allow-Headers',
            implode(', ', config('cors.allowed_headers', ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With']))
        );

        if ($supportsCredentials) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
    }

    /**
     * Get allowed origins based on environment
     *
     * @return array
     */
    private function getAllowedOrigins(): array
    {
        if (app()->environment('local', 'testing')) {
            return config('cors.allowed_origins', [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:5173',
                'http://127.0.0.1:5173',
            ]);
        }

        // Allow override via environment variable
        $envOrigins = env('CORS_ALLOWED_ORIGINS');
        if ($envOrigins) {
            return array_map('trim', explode(',', $envOrigins));
        }

        return config('cors.allowed_origins', []);
    }
}
