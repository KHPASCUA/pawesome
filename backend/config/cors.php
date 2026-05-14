<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter(array_map('trim', explode(',', env(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173'
    )))),

    'allowed_headers' => ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'X-CSRF-TOKEN'],

    'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', false),
];
