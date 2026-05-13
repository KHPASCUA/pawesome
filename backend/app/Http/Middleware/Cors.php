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
        $response = $next($request);

        // Production-safe CORS configuration
        $allowedOrigins = $this->getAllowedOrigins();
        $origin = $request->header('Origin');

        // Set appropriate origin based on environment
        if (in_array($origin, $allowedOrigins) || in_array('*', $allowedOrigins)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin ?: '*');
        } elseif (app()->environment('local', 'testing')) {
            // Allow all origins in local development
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }

        // Standard CORS headers
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
        
        // Allow credentials for cookie-based auth (future migration)
        if (app()->environment('local', 'testing')) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(200);
        }

        return $response;
    }

    /**
     * Get allowed origins based on environment
     *
     * @return array
     */
    private function getAllowedOrigins(): array
    {
        if (app()->environment('local', 'testing')) {
            return ['*'];
        }

        // Production origins - should be configured via environment variables
        $productionOrigins = [
            // Add your production frontend domains here
            'https://your-frontend-domain.com',
            'https://your-app.vercel.app',
            // Vercel preview URLs (wildcard for preview deployments)
            'https://*.vercel.app',
        ];

        // Allow override via environment variable
        $envOrigins = env('CORS_ALLOWED_ORIGINS');
        if ($envOrigins) {
            return array_map('trim', explode(',', $envOrigins));
        }

        return $productionOrigins;
    }
}