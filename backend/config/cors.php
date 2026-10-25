<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'media/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', 
        'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,' .
        'http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176,' .
        'https://camgo.com,http://camgo.com,https://www.camgo.com,http://www.camgo.com,' .
        'https://camgobooking.com,http://camgobooking.com,https://www.camgobooking.com,http://www.camgobooking.com,' .
        'https://admintravel.com,http://admintravel.com,https://www.admintravel.com,http://www.admintravel.com,' .
        'https://adminbusiness.com,http://adminbusiness.com,https://www.adminbusiness.com,http://www.adminbusiness.com,' .
        'https://camgo-rho.vercel.app,https://camgo-business.vercel.app,https://camgoadminbusiness.vercel.app,https://camgo-supperadmin.vercel.app'
    )))),

    'allowed_origins_patterns' => env('CORS_ALLOWED_ORIGINS_PATTERNS')
        ? array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS_PATTERNS'))))
        : ['#^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$#', '#^https?:\/\/(www\.)?(camgo\.com|camgobooking\.com|admintravel\.com|adminbusiness\.com)$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
